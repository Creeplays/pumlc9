define(function(require, exports, module) {
    main.consumes = ["Editor", "editors", "ui"];
    main.provides = ["pumlviewer"];
    return main;

    function main(options, imports, register) {
        var Editor = imports.Editor;
        var editors = imports.editors;
        var ui = imports.ui;
        
        /***** Initialization *****/
        
        var extensions = [];

        var puml = require("./lib/puml.js");
        
        function PumlView(){
            var plugin = new Editor("Ajax.org", main.consumes, extensions);
            var container;
            
            var counter = 0;
            var sessionId = 0;
            
            plugin.on("draw", function(e) {
                container = e.htmlNode;
            });
            
            plugin.on("load", function(){
            });
            
            var currentDocument;
            plugin.on("documentLoad", function(e) {
                var doc = e.doc;
                var session = doc.getSession();
                
                session.state = e.state || {};
                
                if (!session.div) {
                    session.id = sessionId++;
            
                    var div = document.createElement("div");
                    div.style.position = "absolute";
                    div.style.left = 0;
                    div.style.top = 0;
                    div.style.right = 0;
                    div.style.bottom = 0;
                    div.setAttribute("id", "inner" + session.id);
                    container.appendChild(div);
                    session.div = div;
 
                    session.chart = puml();
                }
                
                function renderDoc(value){
                    session.chart(session.div, value);
                }
                
                // Value
                doc.on("getValue", function get(e) { 
                    return currentDocument == doc 
                        ? session.value
                        : e.value;
                }, session);
                
                doc.on("setValue", function set(e) { 
                    if (currentDocument == doc){ 
                        session.value = e.value;
                        renderDoc(session.value);
                    }
                }, session);
                
                session.state.backgroundColor = "#FFFFFF";
                session.state.dark = false;
 
                session.div.style.backgroundColor = 
                doc.tab.backgroundColor =
                    session.state.backgroundColor || "#FFFFFF";
                
                if (session.state.dark === false)
                    doc.tab.classList.remove("dark");
                else
                    doc.tab.classList.add("dark");
            });
            plugin.on("documentActivate", function(e) {
                if (currentDocument && currentDocument.getSession().div)
                    currentDocument.getSession().div.style.display = "none";
                    
                if (container.firstChild)
                    container.removeChild(container.firstChild); 
                container.appendChild(e.doc.getSession().div);
                
                currentDocument = e.doc;
                var session = e.doc.getSession();
                session.div.style.display = "block";
            });
            plugin.on("documentUnload", function(e) {
                // Do nothing when switching to an editor of the same type
                if (e.toEditor && e.toEditor.type == e.fromEditor.type)
                    return; 

                var session = e.doc.getSession();
                if(session.div && session.div.parentNode){
                    session.div.parentNode.removeChild(session.div);
                    delete(session.div);
                }
            });
            plugin.on("getState", function(e) {
                var doc = e.doc;
                e.state.backgroundColor = doc.tab.backgroundColor;
                e.state.dark = doc.tab.classList.names.indexOf("dark") > -1;
            });
            plugin.on("setState", function(e) {
                e.doc.tab.backgroundColor = e.state.backgroundColor || "#FFFFFF";
                if (e.state.dark)
                    e.doc.tab.classList.add("dark");
            });
            plugin.on("clear", function(){
            });
            plugin.on("focus", function(){
            });
            plugin.on("enable", function(){
            });
            plugin.on("disable", function(){
            });
            plugin.on("unload", function(){
            });
            
            plugin.freezePublicAPI({
            });
            
            plugin.load("pumlviewer" + counter++);
            
            return plugin;
        }
        PumlView.autoload = true;
        
        register(null, {
            pumlviewer: editors.register("pumlviewer", "Puml Graph Viewer", 
                                         PumlView, extensions)
        });
    }
});
