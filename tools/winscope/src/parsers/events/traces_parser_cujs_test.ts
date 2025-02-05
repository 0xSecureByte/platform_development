/*
 * Copyright (C) 2023 The Android Open Source Project
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
import {TimestampType} from 'common/time';
import {NO_TIMEZONE_OFFSET_FACTORY} from 'common/timestamp_factory';
import {PropertyTreeBuilder} from 'test/unit/property_tree_builder';
import {UnitTestUtils} from 'test/unit/utils';
import {Parser} from 'trace/parser';
import {TraceType} from 'trace/trace_type';
import {PropertyTreeNode} from 'trace/tree_node/property_tree_node';
import {CujType} from './cuj_type';

describe('ParserCujs', () => {
  let parser: Parser<PropertyTreeNode>;

  beforeAll(async () => {
    parser = (await UnitTestUtils.getTracesParser([
      'traces/eventlog.winscope',
    ])) as Parser<PropertyTreeNode>;
  });

  it('has expected trace type', () => {
    expect(parser.getTraceType()).toEqual(TraceType.CUJS);
  });

  it('provides elapsed timestamps', () => {
    const timestamps = assertDefined(
      parser.getTimestamps(TimestampType.ELAPSED),
    );

    expect(timestamps.length).toEqual(16);

    const expected = [
      NO_TIMEZONE_OFFSET_FACTORY.makeElapsedTimestamp(2661012770462n),
      NO_TIMEZONE_OFFSET_FACTORY.makeElapsedTimestamp(2661012874914n),
      NO_TIMEZONE_OFFSET_FACTORY.makeElapsedTimestamp(2661012903966n),
    ];
    expect(timestamps.slice(0, 3)).toEqual(expected);
  });

  it('provides real timestamps', () => {
    const expected = [
      NO_TIMEZONE_OFFSET_FACTORY.makeRealTimestamp(1681207048025446000n),
      NO_TIMEZONE_OFFSET_FACTORY.makeRealTimestamp(1681207048025551000n),
      NO_TIMEZONE_OFFSET_FACTORY.makeRealTimestamp(1681207048025580000n),
    ];

    const timestamps = parser.getTimestamps(TimestampType.REAL)!;

    expect(timestamps.length).toEqual(16);

    expect(timestamps.slice(0, 3)).toEqual(expected);
  });

  it('contains parsed CUJ events', async () => {
    const entry = await parser.getEntry(2, TimestampType.REAL);

    const expected = new PropertyTreeBuilder()
      .setRootId('CujTrace')
      .setName('cuj')
      .setIsRoot(true)
      .setChildren([
        {
          name: 'startCujType',
          value: CujType.CUJ_LAUNCHER_APP_SWIPE_TO_RECENTS,
        },
        {
          name: 'startTimestamp',
          children: [
            {name: 'unixNanos', value: 1681207048025580000n},
            {name: 'elapsedNanos', value: 2661012903966n},
            {name: 'systemUptimeNanos', value: 2661012904007n},
          ],
        },
        {
          name: 'endTimestamp',
          children: [
            {name: 'unixNanos', value: 1681207048656617000n},
            {name: 'elapsedNanos', value: 2661643941035n},
            {name: 'systemUptimeNanos', value: 266164394123n},
          ],
        },
        {name: 'canceled', value: false},
      ])
      .build();

    expect(entry).toEqual(expected);
  });
});
