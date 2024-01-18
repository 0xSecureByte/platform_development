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
import {ComponentFixture, ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {TreeNodePropertiesDataViewComponentLegacy} from './tree_node_properties_data_view_component';

describe('TreeNodePropertiesDataViewComponentLegacy', () => {
  let fixture: ComponentFixture<TreeNodePropertiesDataViewComponentLegacy>;
  let component: TreeNodePropertiesDataViewComponentLegacy;
  let htmlElement: HTMLElement;

  beforeAll(async () => {
    await TestBed.configureTestingModule({
      providers: [{provide: ComponentFixtureAutoDetect, useValue: true}],
      declarations: [TreeNodePropertiesDataViewComponentLegacy],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeNodePropertiesDataViewComponentLegacy);
    component = fixture.componentInstance;
    htmlElement = fixture.nativeElement;
  });

  it('can be created', () => {
    expect(component).toBeTruthy();
  });
});