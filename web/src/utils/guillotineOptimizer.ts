import type {
  PieceSpec2D,
  PlacedPiece2D,
  Strip2D,
  BoardLayout2D,
  GuillotineCut2D,
  GuillotineOptimizationResult,
} from '../types/optimizer';

interface GuillotineOptions {
  boardWidth: number; // mm
  boardHeight: number; // mm
  kerf?: number; // mm (default 3 for saw, 0 for glass)
  allowRotate?: boolean; // default true
  objective?: 'waste' | 'cuts' | 'balanced';
  forceTwoCols?: boolean;
}

// Shelf packer (Next Fit Decreasing Height) for a column
export function packColumnShelves(
  boardIndex: number,
  colX: number,
  colW: number,
  boardH: number,
  items: { specId: string; w: number; h: number; id: string; label: string }[],
  kerf: number,
  allowRotate: boolean,
  startingY = 0
): { success: boolean; usedHeight: number; placed: PlacedPiece2D[]; strips: Strip2D[] } {
  // Try orientation that fits and maximizes height
  const sortable = items.map((it) => {
    const o1 = { w: it.w, h: it.h, rot: false };
    const o2 = allowRotate ? { w: it.h, h: it.w, rot: true } : null;
    const feasible = [o1, o2].filter((c): c is { w: number; h: number; rot: boolean } => c !== null && c.w <= colW);

    if (feasible.length === 0) return { ...it, w: it.w, h: it.h, rot: false, keyH: -1 };
    feasible.sort((a, b) => b.h - a.h);
    const best = feasible[0];
    return { ...it, w: best.w, h: best.h, rot: best.rot, keyH: best.h };
  });

  if (sortable.some((s) => s.keyH === -1)) {
    return { success: false, usedHeight: 0, placed: [], strips: [] };
  }

  // Sort descending by height
  sortable.sort((a, b) => b.h - a.h || Math.max(b.w, b.h) - Math.max(a.w, a.h));

  const strips: Strip2D[] = [];
  const placed: PlacedPiece2D[] = [];

  let y = startingY;

  while (sortable.length > 0) {
    const stripItems: typeof sortable = [];
    const stripHeight = sortable[0].h;

    // Grab items that fit within this strip's ceiling
    for (let i = 0; i < sortable.length; ) {
      if (sortable[i].h <= stripHeight) {
        stripItems.push(sortable.splice(i, 1)[0]);
      } else {
        i++;
      }
    }

    let used = 0;
    const rowPieces: PlacedPiece2D[] = [];

    for (let i = 0; i < stripItems.length; ) {
      const it = stripItems[i];
      const needW = used === 0 ? it.w : it.w + kerf;

      if (colX + used + needW <= colX + colW) {
        const px = colX + (used === 0 ? 0 : used + kerf);
        const piece: PlacedPiece2D = {
          id: it.id,
          specId: it.specId,
          width: it.w,
          height: it.h,
          rotated: it.rot,
          x: px,
          y,
          boardIndex,
          stripIndex: strips.length,
          label: it.label,
        };
        rowPieces.push(piece);
        used = px - colX + it.w;
        i++;
      } else {
        // Return piece back for next strip
        sortable.unshift(stripItems.splice(i, 1)[0]);
      }
    }

    const strip: Strip2D = {
      x: colX,
      width: colW,
      y,
      height: stripHeight,
      pieces: rowPieces,
      usedWidth: used,
    };
    strips.push(strip);
    placed.push(...rowPieces);

    y = y + stripHeight + kerf;
    if (y > boardH + 1e-6) {
      return { success: false, usedHeight: 0, placed: [], strips: [] };
    }
  }

  const usedHeight =
    strips.length === 0
      ? 0
      : strips[strips.length - 1].y + strips[strips.length - 1].height - startingY;
  return { success: true, usedHeight, placed, strips };
}

// Fallback multi-board guillotine strip packer
function packGuillotineMulti(
  boardW: number,
  boardH: number,
  specs: PieceSpec2D[],
  kerf: number,
  allowRotate: boolean,
  objective: 'waste' | 'cuts' | 'balanced'
): { boards: BoardLayout2D[]; allPieces: PlacedPiece2D[] } {
  const expanded: { specId: string; w: number; h: number; id: string; label: string }[] = [];
  let counter = 1;

  for (const s of specs) {
    for (let i = 0; i < s.quantity; i++) {
      expanded.push({
        specId: s.id,
        w: s.width,
        h: s.height,
        id: `#${counter++}`,
        label: s.label || s.id,
      });
    }
  }

  // Sort strategy based on objective
  expanded.sort((a, b) => {
    const aMax = Math.max(a.w, a.h);
    const bMax = Math.max(b.w, b.h);
    const aArea = a.w * a.h;
    const bArea = b.w * b.h;
    if (objective === 'cuts') return bMax - aMax || bArea - aArea;
    if (objective === 'waste') return bArea - aArea || bMax - aMax;
    return bMax - aMax || bArea - aArea;
  });

  const boards: BoardLayout2D[] = [];
  const placed: PlacedPiece2D[] = [];

  function createBoard(): BoardLayout2D {
    const b: BoardLayout2D = {
      index: boards.length,
      width: boardW,
      height: boardH,
      strips: [],
      columnSplits: [],
    };
    boards.push(b);
    return b;
  }

  let currentBoard = createBoard();

  for (const item of expanded) {
    let placedInExisting = false;

    // Search existing strips for fit
    for (let idx = 0; idx < currentBoard.strips.length; idx++) {
      const st = currentBoard.strips[idx];
      const nextX = st.pieces.length === 0 ? st.x : st.x + st.usedWidth + kerf;

      const orients = allowRotate
        ? [
            { w: item.w, h: item.h, rot: false },
            { w: item.h, h: item.w, rot: true },
          ]
        : [{ w: item.w, h: item.h, rot: false }];

      for (const o of orients) {
        if (o.h <= st.height && nextX + o.w <= st.x + st.width) {
          const piece: PlacedPiece2D = {
            id: item.id,
            specId: item.specId,
            width: o.w,
            height: o.h,
            rotated: o.rot,
            x: nextX,
            y: st.y,
            boardIndex: currentBoard.index,
            stripIndex: idx,
            label: item.label,
          };
          st.pieces.push(piece);
          st.usedWidth = piece.x - st.x + piece.width;
          placed.push(piece);
          placedInExisting = true;
          break;
        }
      }
      if (placedInExisting) break;
    }

    if (placedInExisting) continue;

    // Create a new horizontal strip
    const orients = allowRotate
      ? [
          { w: item.w, h: item.h, rot: false },
          { w: item.h, h: item.w, rot: true },
        ]
      : [{ w: item.w, h: item.h, rot: false }];
    orients.sort((a, b) => b.h - a.h);

    const chosen = orients[0];
    const totalHeightUsed = currentBoard.strips.reduce(
      (acc, s, i) => acc + s.height + (i > 0 ? kerf : 0),
      0
    );
    const stripY = totalHeightUsed + (currentBoard.strips.length > 0 ? kerf : 0);

    // If out of board height, spawn a new board
    if (stripY + chosen.h > boardH) {
      currentBoard = createBoard();
    }

    const currentY =
      currentBoard.strips.reduce((acc, s, i) => acc + s.height + (i > 0 ? kerf : 0), 0) +
      (currentBoard.strips.length > 0 ? kerf : 0);

    const newStrip: Strip2D = {
      x: 0,
      width: boardW,
      y: currentY,
      height: chosen.h,
      pieces: [],
      usedWidth: 0,
    };
    currentBoard.strips.push(newStrip);

    const piece: PlacedPiece2D = {
      id: item.id,
      specId: item.specId,
      width: chosen.w,
      height: chosen.h,
      rotated: chosen.rot,
      x: 0,
      y: newStrip.y,
      boardIndex: currentBoard.index,
      stripIndex: currentBoard.strips.length - 1,
      label: item.label,
    };
    newStrip.pieces.push(piece);
    newStrip.usedWidth = chosen.w;
    placed.push(piece);
  }

  return { boards, allPieces: placed };
}

// Compute exact guillotine cuts without duplicate overlaps
function computeGuillotineCuts(
  boards: BoardLayout2D[],
  _boardW: number,
  boardH: number,
  kerf: number
): GuillotineCut2D[] {
  const cuts: GuillotineCut2D[] = [];
  let cid = 1;
  const keySet = new Set<string>();

  for (const b of boards) {
    // 1. Column splits (Stage 1 cuts)
    (b.columnSplits || []).forEach((x) => {
      const k = `B${b.index}|V|${x}|0|${x}|${boardH}`;
      if (!keySet.has(k)) {
        keySet.add(k);
        cuts.push({
          id: cid++,
          type: 'V',
          x1: x,
          y1: 0,
          x2: x,
          y2: boardH,
          boardIndex: b.index,
          stage: 1,
        });
      }
    });

    // 2. Horizontal strip cuts (Stage 2 cuts)
    for (let i = 0; i < b.strips.length; i++) {
      const st = b.strips[i];
      const y = st.y + st.height;
      const k = `B${b.index}|H|${st.x}|${y}|${st.x + st.width}|${y}`;

      if (y < boardH && !keySet.has(k)) {
        keySet.add(k);
        cuts.push({
          id: cid++,
          type: 'H',
          x1: st.x,
          y1: y,
          x2: st.x + st.width,
          y2: y,
          boardIndex: b.index,
          stage: 2,
        });
      }
    }

    // 3. Vertical pieces chops (Stage 3 cuts)
    for (const st of b.strips) {
      for (let i = 0; i < st.pieces.length - 1; i++) {
        const p = st.pieces[i];
        const x = p.x + p.width + kerf / 2;
        const k = `B${b.index}|V|${x}|${st.y}|${x}|${st.y + st.height}`;

        if (!keySet.has(k)) {
          keySet.add(k);
          cuts.push({
            id: cid++,
            type: 'V',
            x1: x,
            y1: st.y,
            x2: x,
            y2: st.y + st.height,
            boardIndex: b.index,
            stage: 3,
          });
        }
      }
    }
  }

  return cuts;
}

// Master Optimizer Entry Point
export function optimize2DGuillotine(
  specs: PieceSpec2D[],
  options: GuillotineOptions
): GuillotineOptimizationResult {
  const {
    boardWidth,
    boardHeight,
    kerf = 3,
    allowRotate = true,
    objective = 'balanced',
  } = options;

  const validSpecs = specs.filter((s) => s.width > 0 && s.height > 0 && s.quantity > 0);
  const totalRequiredCount = validSpecs.reduce((acc, s) => acc + s.quantity, 0);

  const { boards, allPieces } = packGuillotineMulti(
    boardWidth,
    boardHeight,
    validSpecs,
    kerf,
    allowRotate,
    objective
  );

  const cuts = computeGuillotineCuts(boards, boardWidth, boardHeight, kerf);

  const totalPieceAreaMm2 = allPieces.reduce((acc, p) => acc + p.width * p.height, 0);
  const totalSheetAreaMm2 = boards.length * boardWidth * boardHeight;

  const totalPieceAreaM2 = totalPieceAreaMm2 / 1_000_000;
  const totalSheetAreaM2 = totalSheetAreaMm2 / 1_000_000;

  const overallUtilization = totalSheetAreaMm2 > 0 ? totalPieceAreaMm2 / totalSheetAreaMm2 : 0;

  return {
    boards,
    allPlacedPieces: allPieces,
    cuts,
    totalSheetsUsed: boards.length,
    totalPlacedCount: allPieces.length,
    totalRequiredCount,
    overallUtilization,
    totalPieceAreaM2,
    totalSheetAreaM2,
  };
}
