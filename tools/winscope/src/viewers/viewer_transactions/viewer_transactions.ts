/*
 * Copyright (C) 2022 The Android Open Source Project
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

import {FunctionUtils} from 'common/function_utils';
import {Timestamp} from 'common/time';
import {TracePositionUpdate, WinscopeEvent} from 'messaging/winscope_event';
import {EmitEvent} from 'messaging/winscope_event_emitter';
import {Traces} from 'trace/traces';
import {TraceType} from 'trace/trace_type';
import {PropertyTreeNode} from 'trace/tree_node/property_tree_node';
import {ViewerEvents} from 'viewers/common/viewer_events';
import {View, Viewer, ViewType} from 'viewers/viewer';
import {Events} from './events';
import {Presenter} from './presenter';
import {UiData} from './ui_data';

class ViewerTransactions implements Viewer {
  static readonly DEPENDENCIES: TraceType[] = [TraceType.TRANSACTIONS];

  private readonly htmlElement: HTMLElement;
  private readonly presenter: Presenter;
  private readonly view: View;
  private emitAppEvent: EmitEvent = FunctionUtils.DO_NOTHING_ASYNC;

  constructor(traces: Traces, storage: Storage) {
    this.htmlElement = document.createElement('viewer-transactions');

    this.presenter = new Presenter(traces, storage, (data: UiData) => {
      (this.htmlElement as any).inputData = data;
    });

    this.htmlElement.addEventListener(Events.VSyncIdFilterChanged, (event) => {
      this.presenter.onVSyncIdFilterChanged((event as CustomEvent).detail);
    });

    this.htmlElement.addEventListener(Events.PidFilterChanged, (event) => {
      this.presenter.onPidFilterChanged((event as CustomEvent).detail);
    });

    this.htmlElement.addEventListener(Events.UidFilterChanged, (event) => {
      this.presenter.onUidFilterChanged((event as CustomEvent).detail);
    });

    this.htmlElement.addEventListener(Events.TypeFilterChanged, (event) => {
      this.presenter.onTypeFilterChanged((event as CustomEvent).detail);
    });

    this.htmlElement.addEventListener(Events.LayerIdFilterChanged, (event) => {
      this.presenter.onLayerIdFilterChanged((event as CustomEvent).detail);
    });

    this.htmlElement.addEventListener(Events.WhatFilterChanged, (event) => {
      this.presenter.onWhatFilterChanged((event as CustomEvent).detail);
    });

    this.htmlElement.addEventListener(
      Events.TransactionIdFilterChanged,
      (event) => {
        this.presenter.onTransactionIdFilterChanged(
          (event as CustomEvent).detail,
        );
      },
    );

    this.htmlElement.addEventListener(Events.EntryClicked, (event) => {
      this.presenter.onEntryClicked((event as CustomEvent).detail);
    });
    this.htmlElement.addEventListener(ViewerEvents.TimestampClick, (event) => {
      this.propagateTimestamp((event as CustomEvent).detail);
    });

    this.htmlElement.addEventListener(
      ViewerEvents.PropertiesUserOptionsChange,
      (event) =>
        this.presenter.onPropertiesUserOptionsChange(
          (event as CustomEvent).detail.userOptions,
        ),
    );

    this.view = new View(
      ViewType.TAB,
      this.getDependencies(),
      this.htmlElement,
      'Transactions',
      TraceType.TRANSACTIONS,
    );
  }

  async onWinscopeEvent(event: WinscopeEvent) {
    await this.presenter.onAppEvent(event);
  }

  setEmitEvent(callback: EmitEvent) {
    this.emitAppEvent = callback;
  }

  async propagateTimestamp(timestampNode: PropertyTreeNode) {
    const timestamp: Timestamp = timestampNode.getValue();
    await this.emitAppEvent(TracePositionUpdate.fromTimestamp(timestamp, true));
  }

  getViews(): View[] {
    return [this.view];
  }

  getDependencies(): TraceType[] {
    return ViewerTransactions.DEPENDENCIES;
  }
}

export {ViewerTransactions};
