// Order matters: the global first, then the grammars that read it. `glsl`
// extends `c`, which the highlighter bundles.
import './prism-global'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-glsl'
