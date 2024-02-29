import {
  Component,
  Input,
  HostBinding,
  ChangeDetectorRef,
  OnChanges
} from "@angular/core";
import { ClassicPreset } from "rete";
import { KeyValue } from "@angular/common";

@Component({
  templateUrl: "./node.component.html",
  styleUrls: ["./node.component.sass"],
  host: {
    "data-testid": "node"
  }
})
export class CircleNode implements OnChanges {
  @Input() data!: ClassicPreset.Node;
  @Input() emit!: (data: any) => void;
  @Input() rendered!: () => void;

  seed = 0;

  @HostBinding("class.selected") get selected() {
    return this.data.selected;
  }

  constructor(private cdr: ChangeDetectorRef) {
    this.cdr.detach();
  }

  ngOnChanges(): void {
    this.cdr.detectChanges();
    requestAnimationFrame(() => this.rendered());
    this.seed++; // force render sockets
  }

  sortByIndex(a: KeyValue<string, any>, b: KeyValue<string, any>) {
    const ai = a.value.index || 0;
    const bi = b.value.index || 0;

    return ai - bi;
  }

  emitSocket = (props: any) => {
    const id = this.data.id
    const ref = props.data.element
    const sockets = [
      ['input', this.data.inputs['default']?.socket] as const,
      ['output', this.data.outputs['default']?.socket] as const
    ]

    for (const [side, socket] of sockets) {
      this.emit({
        type: 'render', data: {
          type: 'socket',
          side,
          key: 'default',
          nodeId: id,
          element: ref,
          payload: socket as any
        }
      })
      requestAnimationFrame(() => {
        this.emit({
          type: 'rendered', data: {
            type: 'socket',
            side,
            key: 'default',
            nodeId: id,
            element: ref,
            payload: socket as any
          }
        })
      })
    }
  }
}
