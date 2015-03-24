define(function(require, exports, module) {
    main.consumes = [
        "Plugin", "ui", "commands", "menus", "tabManager", "tree", "util", "watcher"
    ];
    main.provides = ["pumlcommand"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var ui = imports.ui;
        var menus = imports.menus;
        var commands = imports.commands;
        var tabs = imports.tabManager;
        var tree = imports.tree;
        var util = imports.util;
        var watcher = imports.watcher;

        /***** Initialization *****/
        var plugin = new Plugin("Smv Module Code Snip", main.consumes);
        
        /***** Methods *****/
        function showDocInEditor(path, graphType) {
          tabs.open({
              path: path,
              editorType: "pumlviewer",
              forceNew: true,
              focus: true
              },function(err, tab) {
                  watcher.watch(path);
                  watcher.on("change", function(e){
                    if(e.path == path){
                        tabs.reload(tab, function(){})
                    }
                  }, plugin);
              });
        }
        
        function showCurrentDocInEditor(editorType) {
          var currentTab = tabs.focussedTab;
          var path = currentTab.path
          currentTab.cleanUp();
          currentTab.close();
          showDocInEditor(path, editorType);
        }
        
        function selectedNodeExt() {
            var node = tree.selectedNode;
            if (!node || node.isFolder) return "";
            var path = util.normalizePath(node.path);
            var ext = path.substr(path.lastIndexOf('.') + 1);
            console.log(path);
            return ext;
        }
        
        function showSelectedFileInEditor(editorType) {
            var node = tree.selectedNode;
            if (!node || node.isFolder) return;
            var path = util.normalizePath(node.path);
            showDocInEditor(path, editorType);
        }
 
        function load() {
            commands.addCommand({
                name: "smvShowPuml",
                group: "smv",
                isAvailable: function() {return true;},
                hint: "Show PlantUml Graph",
                exec: function() {
                    showCurrentDocInEditor("puml");
                }
            },plugin);
            
            commands.addCommand({
                name: "smvOpenPuml",
                group: "smv",
                isAvailable: function(){ return true; },
                exec: function() {
                    showSelectedFileInEditor("puml");
                }
            }, plugin);
            
            menus.addItemByPath("Tools/Show Plant UML", new ui.item({
                command: "smvShowPuml"
            }), 1000, plugin);

            tree.getElement("mnuCtxTree", function(mnuCtxTree) {
                ui.insertByIndex(mnuCtxTree, new ui.divider(), 10000, plugin);

                plugin.smvMnuPuml = new ui.item({
                    match: "file",
                    caption: "Open Puml Graph",
                    command: "smvOpenPuml"
                })
                ui.insertByIndex(mnuCtxTree, plugin.smvMnuPuml, 10300, plugin);

                mnuCtxTree.on("display", function(){
                    var ext = selectedNodeExt();
                    plugin.smvMnuPuml.setAttribute("disabled", (ext != "puml"));
                },plugin);

            });

        }
          
        /***** Lifecycle *****/
        
        plugin.on("load", function() {
            load();
        });

        plugin.on("unload", function() {
        });
        
        /***** Register and define API *****/
        
        register(null, {
            "pumlcommand": plugin
        });
    }
});
