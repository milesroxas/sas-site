import { Prism } from 'prism-react-renderer'

/**
 * Prism grammar files register themselves on a global `Prism`. The highlighter
 * vendors its own instance, so that instance is published here first. This has
 * to be its own module: ES imports are hoisted, so an assignment in the same
 * file as the grammar imports would run after them.
 */
;(globalThis as { Prism?: typeof Prism }).Prism = Prism
