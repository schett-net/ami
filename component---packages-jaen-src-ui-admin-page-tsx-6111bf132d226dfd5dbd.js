"use strict";(self.webpackChunkdemo=self.webpackChunkdemo||[]).push([[772],{946:function(n,e){var t=function(n){var e=window.location.href.indexOf("#");window.location.replace(window.location.href.slice(0,e>=0?e:0)+"#"+n)},i=function(n){var e,t;return{pathname:n||(e=window.location.href,-1===(t=e.indexOf("#"))?"":e.substring(t+1)),search:""}};e.Z=function(){var n=i();return function(n){""===n.pathname&&t("/")}(n),{get location(){return i()},addEventListener:function(n,e){window.addEventListener(n,e)},removeEventListener:function(n,e){window.removeEventListener(n,e)},history:{state:n,pushState:function(e,t,o){var r;n=i(o),r=o,window.location.hash=r},replaceState:function(e,o,r){n=i(r),t(r)}}}}},50091:function(n,e,t){t.r(e);var i=t(83567),o=t(64541),r=t(946),a=t(92761),c=(0,r.Z)(),u=(0,o.createHistory)(c),d=(0,i.Xt)((function(n){return"undefined"==typeof window?null:(0,a.jsx)(o.LocationProvider,{history:u,children:(0,a.jsx)(o.Router,{primary:!1,children:""})})}));e.default=d}}]);
//# sourceMappingURL=component---packages-jaen-src-ui-admin-page-tsx-6111bf132d226dfd5dbd.js.map