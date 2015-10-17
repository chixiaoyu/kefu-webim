/*
    客服接入js
    version 1.0.0
*/
;(function(window, undefined) {
    'use strict';

    var message, iframe, iframeId, curChannel, curUser, eTitle = document.title,
        iframePosition = {//iframe position
            x: 0
            , y: 0
        },
        shadow = document.createElement('div'),
        newTitle = '\-\新\消\息\提\醒', titleST = 0, initdata;
    
    var getConfig = function(key){//get config from current script
        var that;
        if(!!key) {
            var scripts = document.scripts;
            for(var s = 0, l=scripts.length; s<l; s++) {
                if(scripts[s].src && 0 < scripts[s].src.indexOf(key)) {
                    that = scripts[s].src;
                    break;
                }
            }
        } else {
            that = location.href;
        }
        
        var obj = {}
        if(!that) return {
            str: ''
            , json: obj
            , domain: ''
        };

        var tmp,
            idx = that.indexOf('?'),
            sIdx = that.indexOf('//') > -1 ? that.indexOf('//') : 0,
            domain = that.slice(sIdx, that.indexOf('/', sIdx + 2)),
            arr = that.slice(idx+1).split('&');
        
        obj.src = that.slice(0, idx);
        for(var i=0,l=arr.length;i<l;i++) {
            tmp = arr[i].split('=');
            obj[tmp[0]] = tmp.length>1 ? tmp[1] : '';
        }
        return {
            str: that
            , json: obj
            , domain: domain + '/'
        };
    }
    
    var config = getConfig('easemob.js');
    config.json.hide = config.json.hide == 'false' ? false : config.json.hide;

    //open Api
    var open = function(){
        message.listenToIframe(function(msg){
            var user, channel, group;
            if(msg.indexOf('setuser') > -1) {
                user = msg.split('@').length > 0 ? msg.split('@')[1] : '';
                msg = msg.split('@').length > 0 ? msg.split('@')[0] : '';
            }

            if(msg.indexOf('setchannel') > -1) {
                channel = msg.split('@').length > 0 ? msg.split('@')[1] : '';
                msg = msg.split('@').length > 0 ? msg.split('@')[0] : '';
            }
            
            if(msg.indexOf('setgroupuser') > -1) {
                var idx = msg.indexOf('@emgroupuser@');
                
                user = msg.slice(13, idx);
                group = unescape(msg.slice(idx + 13));
                msg = 'setgroupuser';
            }

            switch(msg) {
                case 'msgPrompt'://title slide
                    var l = 1, p, tArr = (eTitle + newTitle).split('');
                    clearInterval(titleST);
                    titleST = setInterval(function() {
                        p = tArr.shift();
                        document.title = p + Array.prototype.join.call(tArr, '');
                        tArr.push(p);
                    }, 100);
                    break;
                case 'recoveryTitle':
                    clearInterval(titleST);
                    document.title = eTitle;
                    break;
                case 'showChat'://show Chat window
                    iframe.style.width = '400px';
                    iframe.style.height = '500px';
                    if(iframePosition.x == 0 && iframePosition.y == 0) {
                        iframe.style.right = '10px';
                    } else {
                        iframe.style.right = iframePosition.x + 'px';
                        iframe.style.bottom = iframePosition.y + 'px';
                    }
                    
                    iframe.style.cssText += 'box-shadow: 0 4px 8px rgba(0,0,0,.2);border-radius: 4px;*border: 1px solid #ccc;border: 1px solid #ccc\\9;';
                    break;
                case 'minChat'://show Chat window
                    iframe.style.boxShadow = 'none';
                    iframe.style.borderRadius = '4px;';
                    iframe.style.right = '-5px';
                    iframe.style.bottom = '10px';
                    iframe.style.border = 'none';
                    if(!config.json.hide) {
                        iframe.style.height = '37px';
                        iframe.style.width = '102px';
                    } else {
                        iframe.style.width = '0';
                        iframe.style.height = '0';
                    }
                    break;
                case 'setuser':
                    Emc.setcookie('emKefuUser', user);
                    break;
                case 'setgroupuser':
                    Emc.setcookie(group, user);
                    break;
                case 'setchannel':
                    Emc.setcookie('emKefuChannel', channel);
                    break;
                case 'dragready':
                    shadow.style.display = 'block';
                    iframe.style.display = 'none';
                    EasemobWidget.utils.on(document, 'mousemove', _move);
                    break;
                default: break;
            }   
        });

        //open to customers
        window.easemobIM = function(group){
            if(EasemobWidget.utils.isMobile) {
                var i = document.getElementById(iframeId);
                var a = window.event.srcElement || window.event.target;
                if(!!group) {//技能组

                    a.setAttribute('href', i.getAttribute('src') + '&emgroup=' + escape(group));
                    a.setAttribute('target', '_blank');
                } else {
                    a.setAttribute('href', i.getAttribute('src'));
                    a.setAttribute('target', '_blank');
                }
            } else {
                if(!!group) {//技能组
                    var groupUser = Emc.getcookie(group);

                    message.sendToIframe('emgroup@' + groupUser + '@emgroupuser@' + escape(group));
                } else {
                    message.sendToIframe('imclick');
                }
            }
        }
        //...etc.
    }
    
    //add kefu widget
    var appendIframe = function(){
        iframe = (/MSIE (6|7|8)/).test(navigator.userAgent)
            ? document.createElement('<iframe name="' + new Date().getTime() + '">')
            : document.createElement('iframe');
        iframeId = 'EasemobIframe' + new Date().getTime();
        iframe.id = iframeId;
        iframe.name = new Date().getTime();
        iframe.frameBorder = 0;
        iframe.allowTransparency = 'true';
        iframe.style.cssText = '\
            z-index:16777269;\
            overflow:hidden;\
            position:fixed;\
            bottom:10px;\
            right:-5px;\
            border:none;\
            width:400px;\
            height:0;\
            display:none;\
            transition:all .01s;';
        shadow.style.cssText = '\
            display:none;\
            cursor:move;\
            z-index:16777270;\
            position:fixed;\
            bottom:10px;\
            right:-5px;\
            border:none;\
            width:400px;\
            height:500px;\
            background-color:rgb(200,200,200);\
            background-color:rgba(0,0,0,.1);';

        
        initdata = 'initdata:' + config.domain + 'webim/im.html?tenantId=' + config.json.tenantId 
            + (config.json.hide ? '&hide=true' : '') 
            + (config.json.color ? '&color=' + config.json.color : '')
            + (config.json.preview ? '&preview=' + config.json.preview : '')
            + (curChannel ? '&c=' + curChannel : '')
            + (curUser ? '&u=' + curUser : '')
            + '&time=' + new Date().getTime();
        iframe.src = config.domain + 'webim/im.html?tenantId=' + config.json.tenantId;

        if(!config.json.hide) {
            iframe.style.height = '37px';
            iframe.style.width = '100px';
        }
        if(EasemobWidget.utils.isMobile) {
            iframe.style.cssText += 'left:0;bottom:0';
            iframe.style.width = '100%';   
        }
        if(config.json && config.json.preview) {
            var curDom = document.getElementById(config.json.previewid);
            curDom ? curDom.appendChild(iframe) : document.body.appendChild(iframe);
        } else {
            document.body.appendChild(shadow);
            document.body.appendChild(iframe);
        }
        if(iframe.readyState) {
            iframe.onreadystatechange = function() {
                if(iframe.readyState == "loaded" || iframe.readyState == "complete") {
                    this.style.display = 'block';
                    message = new EmMessage(iframeId);
                    open();
                    message.sendToIframe(initdata);
                }
            }
        } else {
            iframe.onload = function() {
                this.style.display = 'block';
                message = new EmMessage(iframeId);
                open();
                message.sendToIframe(initdata);
            }
        }
    }

    //append easemob.utils.js
    var script = document.createElement('script');
    script.src = config.domain + 'webim/easemob.utils.js';
    (document.head || document.getElementsByTagName('head')[0]).appendChild(script);
    if(script.readyState) {
        script.onreadystatechange = function() {
            if(script.readyState == "loaded" || script.readyState == "complete") {
                curUser = Emc.getcookie('emKefuUser');
                curChannel = Emc.getcookie('emKefuChannel');
                appendIframe();
                EasemobWidget.utils.on(shadow, 'mouseup', _moveend);
            }
        }
    } else {
        script.onload = function() {
            curUser = Emc.getcookie('emKefuUser');
            curChannel = Emc.getcookie('emKefuChannel');
            appendIframe();
            EasemobWidget.utils.on(shadow, 'mouseup', _moveend);
        }
    }

    var _st = 0;
    var _move = function(e){

        var ev = window.event || e,
            _x = document.body.clientWidth - e.clientX,
            _y = document.body.clientHeight - e.clientY;

        shadow.style.right = _x + 'px';
        shadow.style.bottom = _y + 'px';
        iframePosition = {
            x: _x
            , y: _y
        }
        
        clearTimeout(_st);
        _st = setTimeout(_moveend, 700);
    }
    var _moveend = function(){

        EasemobWidget.utils.remove(document, 'mousemove', _move);
        iframe.style.right = iframePosition.x + 'px';
        iframe.style.bottom = iframePosition.y + 'px';
        shadow.style.display = 'none';
        iframe.style.display = 'block';
    }
    

}(window, undefined));