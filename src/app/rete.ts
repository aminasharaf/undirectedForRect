import { ClassicPreset as Classic, GetSchemes, NodeEditor } from 'rete';
import { Area2D, AreaExtensions, AreaPlugin } from 'rete-area-plugin';
import { ConnectionPlugin } from 'rete-connection-plugin';
import { Injector } from '@angular/core';
import { AngularPlugin, AngularArea2D, Presets as AngularPresets } from 'rete-angular-plugin/16';
import { AutoArrangePlugin, Presets as ArrangePresets } from 'rete-auto-arrange-plugin';
import { ContextMenuPlugin, ContextMenuExtra, Presets as ContextMenuPresets } from 'rete-context-menu-plugin';
import { ConnectionPathPlugin } from "rete-connection-path-plugin";
import { curveLinear, curveNatural } from "d3-shape";
import { ComputedSocketPosition } from './circle-socket';
import { CircleNode } from './editor/node/node.component';
import { CircleSocket } from './editor/socket/socket.component';
import { CustomConnection } from './editor/connection/connection.component';
import { createSelector } from './selector';
import { UniPortConnector } from './connector';

type Schemes = GetSchemes<Node, Connection<Node, Node>>;

class Connection<A extends Node, B extends Node> extends Classic.Connection<
  A,
  B
> {
  selected?: boolean
  click: (data: Connection<A, B>) => void
  remove: (data: Connection<A, B>) => void

  constructor(events: { click: (data: Connection<A, B>) => void, remove: (data: Connection<A, B>) => void }, source: A, target: B, public isLoop?: boolean) {
    super(source, 'default', target, 'default')
    this.click = events.click
    this.remove = events.remove
  }
}

class Node extends Classic.Node {
  width = 250;
  height = 450;

  constructor(label: string) {
    super(label);

    this.addInput('default', new Classic.Input(socket));
    this.addOutput('default', new Classic.Output(socket));
  }
}

type AreaExtra = Area2D<Schemes> | AngularArea2D<Schemes> | ContextMenuExtra;

const socket = new Classic.Socket('socket');

export async function createEditor(container: HTMLElement, injector: Injector) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const angularRender = new AngularPlugin<Schemes, AreaExtra>({ injector });

  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ['Node', () => new Node('D')]
    ]),
  });

  editor.use(area);

  area.use(angularRender);

  area.use(connection);
  area.use(contextMenu);

  const connectionEvents = {
    click: (data: Schemes['Connection']) => {
      selector.selectConnection(data)
    },
    remove: (data: Schemes['Connection']) => {
      editor.removeConnection(data.id)
    }
  }

  connection.addPreset(() => new UniPortConnector(connectionEvents))

  const selector = createSelector(area)

  angularRender.addPreset(AngularPresets.classic.setup({
    socketPositionWatcher: new ComputedSocketPosition(),
    customize: {
      node() {
        return CircleNode
      },
      socket() {
        return CircleSocket
      },
      connection() {
        return CustomConnection
      },
    }
  }));
  angularRender.addPreset(AngularPresets.classic.setup());
  angularRender.addPreset(AngularPresets.contextMenu.setup());

  const pathPlugin = new ConnectionPathPlugin<Schemes, AreaExtra>({
    transformer: () => points => points,
    curve: (data) => {
      if (data.isLoop) return curveNatural
      return curveLinear
    },
    arrow: () => true
  });

   angularRender.use(pathPlugin);

  const a = new Node('A');
  const b = new Node('B');
  const c = new Node('C');

  await editor.addNode(a);
  await editor.addNode(b);
  await editor.addNode(c);

  await editor.addConnection(new Connection(connectionEvents, a, c));
  await editor.addConnection(new Connection(connectionEvents, b, c));
  await editor.addConnection(new Connection(connectionEvents, c, c, true));

  const arrange = new AutoArrangePlugin<Schemes>();

  arrange.addPreset(ArrangePresets.classic.setup());

  area.use(arrange);

  await arrange.layout();

  AreaExtensions.zoomAt(area, editor.getNodes());

  AreaExtensions.simpleNodesOrder(area);

  return {
    destroy: () => area.destroy(),
  };
}
