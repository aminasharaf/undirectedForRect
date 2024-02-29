type Position = { x: number, y: number }
type Size = { width: number, height: number }

export function computeIntersectionPoint(size: Size, end: Position, position: Position) {
  // if (Math.abs(size.width - size.height) > Math.E) 
  // throw new Error('width and height must be equal')

  const radius = size.width / 2
  const centerX = position.x + size.width / 2;
  const centerY = position.y + size.height / 2;

  const dx = end.x - centerX;
  const dy = end.y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= radius) {
    return { x: end.x, y: end.y };
  }
  const angle = Math.atan2(dy, dx);

  const borderX = centerX + radius * Math.cos(angle);
  const borderY = centerY + radius * Math.sin(angle);

  return { x: borderX, y: borderY };
}
