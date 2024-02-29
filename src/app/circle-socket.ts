import { BaseSchemes, GetSchemes, NodeEditor, Scope } from 'rete';
import { BaseSocketPosition } from 'rete-render-utils';
import { computeIntersectionPoint } from './math';
import { LOOP_SCALE } from './consts';

type Position = { x: number, y: number }
type ExpectedScheme = GetSchemes<BaseSchemes['Node'] & { width: number, height: number }, BaseSchemes['Connection']>

type Requires<Schemes extends BaseSchemes> =
  | { type: 'connectionpath', data: { payload: Schemes['Connection'], path?: string, points: Position[] } }


export class ComputedSocketPosition<S extends ExpectedScheme, K> extends BaseSocketPosition<S, K> {

  override attach(scope: Scope<Requires<S>, [K]>): void {
    super.attach(scope as Scope<never, [K]>)
    if (!this.area) return
    const editor = this.area.parentScope<NodeEditor<S>>(NodeEditor)

    scope.addPipe(context => {
      if (!this.area) return context
      if (!context || typeof context !== 'object' || !('type' in context)) return context

      if (context.type === 'connectionpath') {
        const { source, target } = context.data.payload
        const sourceNode = editor.getNode(source)
        const targetNode = editor.getNode(target)
        const points = [...context.data.points]
        const sourceView = sourceNode && this.area.nodeViews.get(sourceNode.id)
        const targetView = targetNode && this.area.nodeViews.get(targetNode.id)

        if (!target) {
          if (!sourceView) return context
          points[0] = computeIntersectionPoint(sourceNode, points[1], sourceView.position)

          return {
            ...context,
            data: {
              ...context.data,
              points
            }
          }
        }

        if (!sourceNode || !targetNode) return context

        const isLoop = sourceNode === targetNode

        if (isLoop) {
          const distance = sourceNode.width * LOOP_SCALE
          const p1 = { x: points[0].x + distance, y: points[0].y - distance * 0.5 }
          const p2 = { x: points[0].x + distance * 0.5, y: points[0].y - distance }

          if (sourceView) points[0] = computeIntersectionPoint(sourceNode, p1, sourceView.position)
          if (targetView) points[1] = computeIntersectionPoint(targetNode, p2, targetView.position)
          points.splice(1, 0, p1, p2)
        } else {
          if (sourceView) {
            points[0] = computeIntersectionPoint(sourceNode, points[1], sourceView.position)
          }
          if (targetView) {
            points[1] = computeIntersectionPoint(targetNode, points[0], targetView.position)
          }
        }
        return {
          ...context,
          data: {
            ...context.data,
            points
          }
        }
      }
      return context
    })
  }

  async calculatePosition(nodeId: string): Promise<Position | null> {
    if (!this.area) return null
    const editor = this.area.parentScope<NodeEditor<S>>(NodeEditor)
    const node = editor.getNode(nodeId)

    if (!node) return null

    return {
      x: node.width / 2,
      y: node.height / 2
    }
  }
}
