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

import {assertDefined} from 'common/assert_utils';
import {Operation} from 'trace/tree_node/operations/operation';
import {PropertyTreeNode} from 'trace/tree_node/property_tree_node';
import {PropertyTreeNodeFactory} from 'trace/tree_node/property_tree_node_factory';

export class AddDisplayProperties implements Operation<PropertyTreeNode> {
  apply(value: PropertyTreeNode): PropertyTreeNode {
    const factory = new PropertyTreeNodeFactory();

    const displays = value.getChildByName('displays');

    if (!displays) return value;

    for (const display of displays.getAllChildren()) {
      const dpiX = display.getChildByName('dpiX');
      const dpiY = display.getChildByName('dpiY');

      if (!(dpiX && dpiY)) continue;

      const size = assertDefined(display.getChildByName('size'));
      const width = assertDefined(size.getChildByName('w')).getValue();
      const height = assertDefined(size.getChildByName('h')).getValue();
      const smallestWidth = this.dpiFromPx(Math.min(width, height), Number(dpiX.getValue()));

      display.addChild(
        factory.makeCalculatedProperty(
          display.id,
          'isLargeScreen',
          smallestWidth >= AddDisplayProperties.TABLET_MIN_DPS
        )
      );

      const layerStack = assertDefined(display.getChildByName('layerStack'));

      display.addChild(
        factory.makeCalculatedProperty(
          display.id,
          'isOn',
          layerStack.getValue() !== AddDisplayProperties.BLANK_LAYER_STACK
        )
      );
    }

    return value;
  }

  private dpiFromPx(size: number, densityDpi: number): number {
    const densityRatio = densityDpi / AddDisplayProperties.DENSITY_DEFAULT;
    return size / densityRatio;
  }

  private static readonly TABLET_MIN_DPS = 600;
  private static readonly DENSITY_DEFAULT = 160;
  private static readonly BLANK_LAYER_STACK = -1;
}