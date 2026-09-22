/**
 * The smallest MCP client a script needs: initialize, list tools, call one.
 * Streamable HTTP with a bearer key, the way Claude Code, Codex and Cursor
 * connect to /api/mcp. Answers may arrive as JSON or as an SSE frame; both
 * are read.
 */

export type McpToolInfo = { name: string; description?: string; inputSchema: unknown }

export type McpToolResult = {
  content: Array<{ type: string; text?: string }>
  isError?: boolean
}

type RpcResponse = { result?: unknown; error?: { code: number; message: string } }

export class McpClient {
  private session: string | undefined
  private nextId = 1

  constructor(
    private readonly server: string,
    private readonly key: string,
  ) {}

  private async rpc(method: string, params: unknown): Promise<unknown> {
    const res = await fetch(`${this.server}/api/mcp`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        authorization: `Bearer ${this.key}`,
        'content-type': 'application/json',
        ...(this.session ? { 'mcp-session-id': this.session } : {}),
      },
      body: JSON.stringify({ id: this.nextId++, jsonrpc: '2.0', method, params }),
    })
    this.session = res.headers.get('mcp-session-id') ?? this.session
    const raw = await res.text()
    if (!res.ok) throw new Error(`${method}: HTTP ${res.status} ${raw.slice(0, 200)}`)
    const body = raw.trim().startsWith('{')
      ? raw
      : raw
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5))
          .join('')
    const parsed = JSON.parse(body) as RpcResponse
    if (parsed.error) throw new Error(`${method}: ${parsed.error.message}`)
    return parsed.result
  }

  async initialize(name = 'sas-site-script'): Promise<{ instructions: string }> {
    const result = (await this.rpc('initialize', {
      capabilities: {},
      clientInfo: { name, version: '0' },
      protocolVersion: '2025-03-26',
    })) as { instructions?: string }
    return { instructions: result.instructions ?? '' }
  }

  async listTools(): Promise<McpToolInfo[]> {
    const result = (await this.rpc('tools/list', {})) as { tools: McpToolInfo[] }
    return result.tools
  }

  async call(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    return (await this.rpc('tools/call', { arguments: args, name })) as McpToolResult
  }

  /** The text of a tool result, every content part joined. */
  static text(result: McpToolResult): string {
    return result.content.map((part) => part.text ?? '').join('')
  }
}
