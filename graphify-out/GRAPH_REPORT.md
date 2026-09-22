# Graph Report - monyun  (2026-09-22)

## Corpus Check
- 118 files · ~218,785 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 997 nodes · 1759 edges · 59 communities (54 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- Win32Window
- configStore.ts
- dependencies
- AppDelegate
- laser_measure_dialog.dart
- OfflineQuotesModal.tsx
- CuttingStudio.tsx
- bundle
- measure_take_screen.dart
- devis_preview_sheet.dart
- my_application.cc
- commands.rs
- devDependencies
- compilerOptions
- desktop/package.json
- opening_spec.dart
- chantiers_screen.dart
- workshops_screen.dart
- compilerOptions
- storage_service.dart
- main.dart
- properties
- definitions
- properties
- definitions
- permissions
- permissions
- wWinMain
- manifest.json
- webviews
- webviews
- State
- CapabilityRemote
- CapabilityRemote
- plugins
- Capability
- Capability
- public/manifest.json
- VillaFacadeStudio3D.tsx
- local
- local
- React + TypeScript + Vite
- MainActivity
- monyun_mobile
- tsconfig.json
- LaunchImage.imageset/README.md
- description
- description
- Value
- Value
- sw.js

## God Nodes (most connected - your core abstractions)
1. `useConfigStore` - 58 edges
2. `playTactileClick()` - 54 edges
3. `playSwitchSound()` - 39 edges
4. `playClampSound()` - 37 edges
5. `react` - 33 edges
6. `Win32Window` - 22 edges
7. `compilerOptions` - 18 edges
8. `playSlideTick()` - 17 edges
9. `getTranslation()` - 17 edges
10. `OfflineQuotesModal()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `wWinMain()` --calls--> `CreateAndAttachConsole()`  [INFERRED]
  mobile/windows/runner/main.cpp → mobile/windows/runner/utils.cpp
- `Win32Window::Win32Window()` --calls--> `Destroy`  [INFERRED]
  mobile/windows/runner/win32_window.cpp → mobile/windows/runner/win32_window.h
- `ScrollDrivenWindowModel()` --calls--> `useConfigStore`  [EXTRACTED]
  web/src/components/3d/CinematicScrollCanvas.tsx → web/src/store/configStore.ts
- `CuttingOptimizerDemo()` --calls--> `useConfigStore`  [EXTRACTED]
  web/src/components/landing/CuttingOptimizerDemo.tsx → web/src/store/configStore.ts
- `my_application_activate()` --calls--> `fl_register_plugins()`  [INFERRED]
  mobile/linux/runner/my_application.cc → mobile/linux/flutter/generated_plugin_registrant.cc

## Import Cycles
- None detected.

## Communities (59 total, 5 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (88): jspdf, react, react, jspdf, react, App(), CinematicScrollCanvas(), VillaFacadeStudio3D() (+80 more)

### Community 1 - "Win32Window"
Cohesion: 0.06
Nodes (53): RegisterPlugins(), DartProject, HWND, LPARAM, LRESULT, UINT, WPARAM, FlutterWindow (+45 more)

### Community 2 - "configStore.ts"
Cohesion: 0.08
Nodes (35): DUST_PARTICLES_POSITIONS, FINISH_PALETTES, GLASS_PALETTES, ScrollDrivenWindowModel(), ScrollModelProps, FINISH_PALETTES, GLASS_PALETTES, HandleProps (+27 more)

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (41): canvas-confetti, clsx, framer-motion, gsap, jspdf-autotable, lenis, lucide-react, qrcode (+33 more)

### Community 4 - "AppDelegate"
Cohesion: 0.06
Nodes (28): Any, Cocoa, Flutter, FlutterAppDelegate, FlutterImplicitEngineBridge, FlutterImplicitEngineDelegate, FlutterMacOS, FlutterPluginRegistry (+20 more)

### Community 5 - "laser_measure_dialog.dart"
Cohesion: 0.06
Nodes (33): CustomPainter, dart:math, double get, _BlueprintGridPainter, build, _buildCrosshairMarker, _buildNudgeButton, _buildPlayChip (+25 more)

### Community 6 - "OfflineQuotesModal.tsx"
Cohesion: 0.13
Nodes (32): OfflineQuotesModal(), OfflineQuotesModalProps, deleteOfflineQuote(), getWorkshopSystemInfo(), invokeTauri(), isTauriDesktop(), listOfflineQuotes(), loadOfflineQuote() (+24 more)

### Community 7 - "CuttingStudio.tsx"
Cohesion: 0.08
Nodes (45): CuttingAssemblyTerminalProps, ThermalLabelsModal(), ThermalLabelsModalProps, ArchSpecification, ArchType, CadCell, CadStructure, CellType (+37 more)

### Community 8 - "bundle"
Cohesion: 0.06
Nodes (30): app, security, windows, build, beforeBuildCommand, beforeDevCommand, devUrl, frontendDist (+22 more)

### Community 9 - "measure_take_screen.dart"
Cohesion: 0.07
Nodes (29): Map, _allegeMm, _applyPreset, build, _buildPresetChip, _buildSelectCard, _buildTradeBlueprintGraphic, _buildTradePresetChips (+21 more)

### Community 10 - "devis_preview_sheet.dart"
Cohesion: 0.08
Nodes (25): devis_preview_sheet.dart, List, MonyunMobileApp, OpeningSpec, build, DevisPreviewSheet, _formatDzd, _generateQuotationText (+17 more)

### Community 11 - "my_application.cc"
Cohesion: 0.09
Nodes (22): FlPluginRegistry, FlView, GApplication, gboolean, gchar, GObject, GtkApplication, fl_register_plugins() (+14 more)

### Community 12 - "commands.rs"
Cohesion: 0.22
Nodes (22): CncBarSpec, CncCutItem, delete_offline_quote(), export_cnc_gcode(), generate_saw_cut_label(), get_quotes_dir(), get_workshop_system_info(), list_offline_quotes() (+14 more)

### Community 13 - "devDependencies"
Cohesion: 0.08
Nodes (24): oxlint, @types/node, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react, devDependencies (+16 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 15 - "desktop/package.json"
Cohesion: 0.10
Nodes (20): dependencies, @tauri-apps/api, @tauri-apps/plugin-dialog, @tauri-apps/plugin-fs, @tauri-apps/plugin-notification, devDependencies, @tauri-apps/cli, name (+12 more)

### Community 16 - "opening_spec.dart"
Cohesion: 0.10
Nodes (20): calculateCost, clientWilaya, copyWith, depthMm, finishColor, fromJson, glassType, heightMm (+12 more)

### Community 17 - "chantiers_screen.dart"
Cohesion: 0.10
Nodes (19): Color, build, _buildFilterChip, createState, _cycleOpeningStatus, _expandedProjects, _formatDzd, _getStatusColor (+11 more)

### Community 18 - "workshops_screen.dart"
Cohesion: 0.10
Nodes (19): address, aluminumRateKg, build, _callPhone, completedJobs, createState, glassRateM2, id (+11 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 20 - "storage_service.dart"
Cohesion: 0.12
Nodes (15): dart:convert, addOpening, _getSeedOpenings, loadOpenings, _openingsKey, removeOpening, saveOpenings, StorageService (+7 more)

### Community 21 - "main.dart"
Cohesion: 0.12
Nodes (16): build, createState, _currentIndex, initState, _isLoading, _loadPersistedSpecs, main, _removeSpec (+8 more)

### Community 22 - "properties"
Cohesion: 0.22
Nodes (9): properties, Identifier, description, oneOf, type, identifier, remote, anyOf (+1 more)

### Community 23 - "definitions"
Cohesion: 0.13
Nodes (14): anyOf, definitions, Number, PermissionEntry, Target, description, anyOf, description (+6 more)

### Community 24 - "properties"
Cohesion: 0.22
Nodes (9): properties, Identifier, description, oneOf, type, identifier, remote, anyOf (+1 more)

### Community 25 - "definitions"
Cohesion: 0.13
Nodes (14): anyOf, definitions, Number, PermissionEntry, Target, description, anyOf, description (+6 more)

### Community 26 - "permissions"
Cohesion: 0.17
Nodes (12): $ref, array, null, description, items, type, uniqueItems, description (+4 more)

### Community 27 - "permissions"
Cohesion: 0.17
Nodes (12): $ref, array, null, description, items, type, uniqueItems, description (+4 more)

### Community 28 - "wWinMain"
Cohesion: 0.24
Nodes (9): _In_, _In_opt_, wWinMain(), string, wchar_t, CreateAndAttachConsole(), GetCommandLineArguments(), Utf8FromUtf16() (+1 more)

### Community 29 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, prefer_related_applications, short_name (+2 more)

### Community 30 - "webviews"
Cohesion: 0.20
Nodes (10): type, webviews, windows, items, description, items, type, description (+2 more)

### Community 31 - "webviews"
Cohesion: 0.20
Nodes (10): type, webviews, windows, items, description, items, type, description (+2 more)

### Community 32 - "State"
Cohesion: 0.23
Nodes (12): MainNavigationHolder, _MainNavigationHolderState, ChantiersScreen, _ChantiersScreenState, MeasureTakeScreen, _MeasureTakeScreenState, WorkshopsScreen, _WorkshopsScreenState (+4 more)

### Community 33 - "CapabilityRemote"
Cohesion: 0.22
Nodes (9): description, properties, required, type, CapabilityRemote, urls, urls, description (+1 more)

### Community 34 - "CapabilityRemote"
Cohesion: 0.22
Nodes (9): description, properties, required, type, CapabilityRemote, urls, urls, description (+1 more)

### Community 35 - "plugins"
Cohesion: 0.22
Nodes (8): oxc, typescript, warn, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 36 - "Capability"
Cohesion: 0.33
Nodes (6): description, required, type, Capability, identifier, permissions

### Community 37 - "Capability"
Cohesion: 0.33
Nodes (6): description, required, type, Capability, identifier, permissions

### Community 38 - "public/manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, lang, name, orientation, short_name (+2 more)

### Community 39 - "VillaFacadeStudio3D.tsx"
Cohesion: 0.29
Nodes (7): FacadeOpening, LightingAtmosphere, Opening3DProps, VillaFacadeCanvas(), VillaFacadeCanvasProps, WallFinish, INITIAL_VILLA_OPENINGS

### Community 40 - "local"
Cohesion: 0.50
Nodes (4): default, description, type, local

### Community 41 - "local"
Cohesion: 0.50
Nodes (4): default, description, type, local

### Community 42 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 54 - "description"
Cohesion: 0.50
Nodes (4): default, description, type, description

### Community 55 - "description"
Cohesion: 0.50
Nodes (4): default, description, type, description

### Community 56 - "Value"
Cohesion: 0.67
Nodes (3): Value, anyOf, description

### Community 57 - "Value"
Cohesion: 0.67
Nodes (3): Value, anyOf, description

## Knowledge Gaps
- **415 isolated node(s):** `name`, `private`, `version`, `type`, `tauri` (+410 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `App.tsx`, `devDependencies`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `jspdf` connect `App.tsx` to `dependencies`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `react` connect `App.tsx` to `configStore.ts`, `plugins`, `OfflineQuotesModal.tsx`, `CuttingStudio.tsx`, `VillaFacadeStudio3D.tsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06401799100449775 - nodes in this community are weakly interconnected._
- **Should `Win32Window` be split into smaller, more focused modules?**
  _Cohesion score 0.0597567424643046 - nodes in this community are weakly interconnected._
- **Should `configStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08163265306122448 - nodes in this community are weakly interconnected._