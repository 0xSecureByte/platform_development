/*
 * Copyright (C) 2024 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Transform} from 'parsers/surface_flinger/transform_utils';
import {TreeNodeUtils} from 'test/unit/tree_node_utils';
import {TraceRectBuilder} from 'trace/trace_rect_builder';
import {HierarchyTreeNode} from 'trace/tree_node/hierarchy_tree_node';
import {UiRect} from 'viewers/components/rects/types2d';
import {UiRectBuilder} from 'viewers/components/rects/ui_rect_builder';
import {PresenterSfUtils} from './presenter_sf_utils';

describe('PresenterSfUtils', () => {
  let hierarchyRoot: HierarchyTreeNode;
  let layer1Node: HierarchyTreeNode;
  let layer2Node: HierarchyTreeNode;
  let expectedlayer1UiRect: UiRect;
  let expectedLayer2UiRect: UiRect;

  beforeEach(() => {
    hierarchyRoot = TreeNodeUtils.makeHierarchyNode({id: 'LayerTraceEntry', name: 'root'});

    layer1Node = TreeNodeUtils.makeHierarchyNode({
      id: 1,
      name: 'layer1',
    });

    layer2Node = TreeNodeUtils.makeHierarchyNode({
      id: 2,
      name: 'layer2',
    });

    layer1Node.addChild(layer2Node);
    hierarchyRoot.addChild(layer1Node);

    expectedlayer1UiRect = new UiRectBuilder()
      .setX(0)
      .setY(0)
      .setWidth(1)
      .setHeight(1)
      .setId('1 layer1')
      .setLabel('layer1')
      .setCornerRadius(0)
      .setDisplayId(0)
      .setTransform(Transform.EMPTY.matrix)
      .setIsVisible(true)
      .setIsDisplay(false)
      .setIsClickable(true)
      .setIsVirtual(false)
      .setHasContent(false)
      .build();

    expectedLayer2UiRect = new UiRectBuilder()
      .setX(0)
      .setY(0)
      .setWidth(1)
      .setHeight(1)
      .setId('2 layer2')
      .setLabel('layer2')
      .setCornerRadius(0)
      .setDisplayId(0)
      .setTransform(Transform.EMPTY.matrix)
      .setIsVisible(true)
      .setIsDisplay(false)
      .setIsClickable(true)
      .setIsVirtual(false)
      .setHasContent(false)
      .build();
  });

  it('extracts rects from hierarchy tree', () => {
    buildRectAndSetToLayerNode(layer1Node, [0]);
    buildRectAndSetToLayerNode(layer2Node, [0, 1]);
    const expectedRects: UiRect[] = [expectedLayer2UiRect, expectedlayer1UiRect];

    expect(PresenterSfUtils.makeUiRects(hierarchyRoot)).toEqual(expectedRects);
  });

  it('handles z-order paths with equal lengths', () => {
    buildRectAndSetToLayerNode(layer1Node, [1]);
    buildRectAndSetToLayerNode(layer2Node, [0]);

    const expectedRects: UiRect[] = [expectedlayer1UiRect, expectedLayer2UiRect];
    expect(PresenterSfUtils.makeUiRects(hierarchyRoot)).toEqual(expectedRects);
  });

  it('handles z-order paths with different lengths', () => {
    buildRectAndSetToLayerNode(layer1Node, [0, 1]);
    buildRectAndSetToLayerNode(layer2Node, [0, 0, 0]);

    const expectedRects: UiRect[] = [expectedlayer1UiRect, expectedLayer2UiRect];
    expect(PresenterSfUtils.makeUiRects(hierarchyRoot)).toEqual(expectedRects);
  });

  it('handles z-order paths with equal values (fall back to Layer ID comparison)', () => {
    buildRectAndSetToLayerNode(layer1Node, [0, 1]);
    buildRectAndSetToLayerNode(layer2Node, [0, 1, 0]);

    const expectedRects: UiRect[] = [expectedLayer2UiRect, expectedlayer1UiRect];
    expect(PresenterSfUtils.makeUiRects(hierarchyRoot)).toEqual(expectedRects);
  });

  function buildRectAndSetToLayerNode(layerNode: HierarchyTreeNode, zOrderPath: number[]) {
    const rect = new TraceRectBuilder()
      .setX(0)
      .setY(0)
      .setWidth(1)
      .setHeight(1)
      .setId(layerNode.id)
      .setName(layerNode.name)
      .setCornerRadius(0)
      .setTransform(Transform.EMPTY.matrix)
      .setZOrderPath(zOrderPath)
      .setGroupId(0)
      .setIsVisible(true)
      .setIsDisplay(false)
      .setIsVirtual(false)
      .build();

    layerNode.setRects([rect]);
  }
});