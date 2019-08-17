/******************************************************************************
 
 This is a binary tree based bin packing algorithm that is more complex than
 the simple Packer (packer.js). Instead of starting off with a fixed width and
 height, it starts with the width and height of the first block passed and then
 grows as necessary to accomodate each subsequent block. As it grows it attempts
 to maintain a roughly square ratio by making 'smart' choices about whether to
 grow right or down.
 
 When growing, the algorithm can only grow to the right OR down. Therefore, if
 the new block is BOTH wider and taller than the current target then it will be
 rejected. This makes it very important to initialize with a sensible starting
 width and height. If you are providing sorted input (largest first) then this
 will not be an issue.
 
 A potential way to solve this limitation would be to allow growth in BOTH
 directions at once, but this requires maintaining a more complex tree
 with 3 children (down, right and center) and that complexity can be avoided
 by simply chosing a sensible starting block.
 
 Best results occur when the input blocks are sorted by height, or even better
 when sorted by max(width,height).
 
 Inputs:
 ------
 
 blocks: array of any objects that have .w and .h attributes
 
 Outputs:
 -------
 
 marks each block that fits with a .fit attribute pointing to a
 node with .x and .y coordinates
 
 Example:
 -------
 
 var blocks = [
 { w: 100, h: 100 },
 { w: 100, h: 100 },
 { w:  80, h:  80 },
 { w:  80, h:  80 },
 etc
 etc
 ];
 
 var packer = new GrowingPacker();
 packer.fit(blocks);
 
 for(var n = 0 ; n < blocks.length ; n++) {
 var block = blocks[n];
 if (block.fit) {
 Draw(block.fit.x, block.fit.y, block.w, block.h);
 }
 }
 
 
 ******************************************************************************/
import { Bloque, Nodo } from "./modelo";

export class GrowingPacker {
    root: Nodo;
    fit(blocks: Bloque[]) {
        blocks.sort((a, b) => {
            return (b.w + b.h) - (a.w + a.h);
        });
        var len = blocks.length;
        var w = len > 0 ? blocks[0].w : 0;
        var h = len > 0 ? blocks[0].h : 0;
        this.root = <Nodo>{ x: 0, y: 0, w: w, h: h };
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var node = this.findNode(this.root, block.w, block.h);
            if (node)
                block.fit = this.splitNode(node, block.w, block.h);
            else
                block.fit = this.growNode(block.w, block.h);
        }
    }

    private findNode(root: Nodo, w: number, h: number): Nodo {
        if (root.used)
            return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
        else if ((w <= root.w) && (h <= root.h))
            return root;
        else
            return null;
    }

    private splitNode(node: Nodo, w: number, h: number): Nodo {
        node.used = true;
        node.down = <Nodo>{ x: node.x, y: node.y + h, w: node.w, h: node.h - h };
        node.right = <Nodo>{ x: node.x + w, y: node.y, w: node.w - w, h: h };
        return node;
    }

    private growNode(w: number, h: number): Nodo {
        var canGrowDown = (w <= this.root.w);
        var canGrowRight = (h <= this.root.h);

        var shouldGrowRight = canGrowRight && (this.root.h >= (this.root.w + w)); // attempt to keep square-ish by growing right when height is much greater than width
        var shouldGrowDown = canGrowDown && (this.root.w >= (this.root.h + h)); // attempt to keep square-ish by growing down  when width  is much greater than height

        if (shouldGrowRight)
            return this.growRight(w, h);
        else if (shouldGrowDown)
            return this.growDown(w, h);
        else if (canGrowRight)
            return this.growRight(w, h);
        else if (canGrowDown)
            return this.growDown(w, h);
        else
            return null; // need to ensure sensible root starting size to avoid this happening
    }

    private growRight(w: number, h: number): Nodo {
        this.root = <Nodo>{
            used: true,
            x: 0,
            y: 0,
            w: this.root.w + w,
            h: this.root.h,
            down: this.root,
            right: { x: this.root.w, y: 0, w: w, h: this.root.h }
        };
        var node = this.findNode(this.root, w, h);
        if (node)
            return this.splitNode(node, w, h);
        else
            return null;
    }

    private growDown(w: number, h: number): Nodo {
        this.root = <Nodo>{
            used: true,
            x: 0,
            y: 0,
            w: this.root.w,
            h: this.root.h + h,
            down: { x: 0, y: this.root.h, w: this.root.w, h: h },
            right: this.root
        };
        var node = this.findNode(this.root, w, h);
        if (node)
            return this.splitNode(node, w, h);
        else
            return null;
    }

};