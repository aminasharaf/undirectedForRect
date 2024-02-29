import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { ClassicPreset } from "rete";

type Connection = ClassicPreset.Connection<
  ClassicPreset.Node,
  ClassicPreset.Node
> & {
  selected?: boolean,
  isLoop?: boolean
  click: (c: Connection) => void
  remove: (c: Connection) => void
}

@Component({
  selector: "connection",
  templateUrl: "./connection.component.html",
  styleUrls: ["./connection.component.sass"]
})
export class CustomConnection {
  @Input() data!: Connection
  @Input() start: any;
  @Input() end: any;
  @Input() path!: string;

  @ViewChild('pathREf', { static: false }) pathREf!: ElementRef<SVGPathElement>;

  get point() {
    if (!this.pathREf) return { x: 0, y: 0 }
    const path = this.pathREf.nativeElement
    const markerLength = 15
    const point = path.getPointAtLength((path.getTotalLength() - markerLength) / 2)

    return point
  }
}
