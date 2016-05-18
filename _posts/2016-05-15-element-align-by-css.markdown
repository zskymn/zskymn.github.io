---
layout:     post
title:      "纯CSS实现元素的水平居中和垂直居中"
author:     闲游
date:       2016-05-18
catalog:    true
tags:
    - 前端
    - CSS
---

> 元素的水平和垂直居中是前端经常遇到的问题，本文将提供一些居中的纯CSS实现

## 元素的高度和宽度已确定

```html
<!-- html -->

<div class="parent">
  <h1>父元素</h1>
  <div class="child">
    <h1>子元素</h1>
  </div>
</div>
```

```css
/* css */

.parent {
  position: relative;
  width: 500px;
  height: 500px;
  background-color: red;
  padding: 20px;
}

.child {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 200px;
  height: 300px;
  background-color: green;
  margin-top: -150px;
  margin-left: -100px;
  padding: 15px;
}
```

> 父元素需要设置`position`属性值为`absolute`、`relative`或`fixed`；元素默认的`position`属性值为`static`

## 元素的高度和宽度未确定

```html
<!-- html -->

<div class="parent">
  <h1>父元素</h1>
  <div class="child">
    <h1>子元素</h1>
  </div>
</div>
```

```css
/* css */

.parent {
  position: relative;
  width: 500px;
  height: 500px;
  background-color: red;
  padding: 20px;
}

.child {
  position: absolute;
  left: 50%;
  top: 50%;
  background-color: green;
  transform: translate(-50%, -50%);
  padding: 15px;
}
```

> 当然，元素高宽确定的情况下也可以使用该方法；`transform`属性是`CSS3`才支持的，目前[大多数浏览器](http://caniuse.com/#feat=transforms2d)都支持了该属性
