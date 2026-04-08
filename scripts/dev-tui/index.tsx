import { render } from 'ink'
import { App } from './App'

const nodeMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10)
if (nodeMajor < 20) {
  console.error(
    `This TUI requires Node.js 20+ (current: ${process.version}). Upgrade Node or run pnpm scripts directly.`,
  )
  process.exit(1)
}

if (!process.stdin.isTTY) {
  console.error(
    'This TUI needs an interactive terminal. Run: pnpm dev:tui\n(Do not pipe input; use your IDE or Terminal.app.)',
  )
  process.exit(1)
}

let unmountInk: () => void = () => {}

const instance = render(<App unmount={() => unmountInk()} />)
unmountInk = instance.unmount

await instance.waitUntilExit()
