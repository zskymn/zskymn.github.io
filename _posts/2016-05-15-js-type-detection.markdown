---
layout:     post
title:      "JavaScript类型检测"
author:     闲游
date:       2016-05-15
catalog:    true
tags:
    - 前端
    - JavaScript
---

> Javascript的类型比较松散，类型的判断容易使人产生困惑，这篇文章就试图来减少这种困惑

## JavaScript数据类型
JavaScript共有6种数据类型，包括5种基本数据类型（String、Number、Boolean、Null和Undefined）和1种复杂数据类型（Object）

#### String类型
String，即字符串，是有16位的Unicode字符组成的字符序列。字符串属于不可变类型，一旦创建，其值就不可改变。

```javascript
var str = 'Hello';
str = str + ' World';
```
上述示例中变量`str`初始时包含字符串"Hello"，而第二行把`str`重新定义为"Hello"和" World"的组合，这个操作的实际过程如下：

1. 创建一个能够容纳11个字符的新字符串
1. 将"Hello"和" World"填充到该新字符串
1. 销毁原来的"Hello"和" World"字符串

#### Number类型
Number类型用来表示整数和浮点数，属于不可变类型。

#### Boolean类型
Boolean类型只有2个字面值：`true`和`false`（区分大小写）。

#### Undefined类型
Undefined类型只有一个值，即`undefined`（区分大小写）。

#### Null类型
Null类型只有一个值，即`null`(区分大小写)，表示一个空对象指针。

#### Object类型
对象实际上就是一组数据和功能的集合，对象可以通过`new`操作符实例化。如下所示：

```javascript
var a = new Object();
```

Object类型所具有的任何属性和方法也同样存在于更具体的对象中（如`Array`等），Object的每个实例都具有下列属性和方法：

* `constructor`：保存着用于创建当前对象的函数。
* `hasOwnProperty(propertyName)`：用于检查给定的属性在当前对象实例中（而不是实例的原型中）是否存在。
* `isPrototypeOf(object1)`：检查该对象实例是否在对象`object1`的原型链中。
* `propertyIsEnumerable(propertyName)`：检查给定的属性是否可以使用`for-in`语句来枚举
* `toLocaleString()`：返回对象的字符串表示，该字符串与执行环境的地区对应
* `toString()`：返回对象的字符串表示
* `valueOf()`：返回对象的字符串、数值或布尔值表示。通常与`toString()`方法的返回值相同。

## JavaScript类型检测
本文主要提供检测JavaScript内置类型的方法

#### String、Number、Boolean和Undefined类型的检测
这些类型的检测使用`typeof`方法就可以做到

```javascript
typeof('Hello World'); // 'string'
typeof(1); // 'number'
typeof(undefined); // 'undefined'
typeof(true); // 'boolean'
```

#### Null类型的检测
Null不能使用`typeof`直接判断，但可以使用`null===null`判断

```javascript
var a = null,
  b = {};
typeof(a); // 'object'
a === null; // true
a ? typeof(a) : 'null'; // 'null'
b ? typeof(b) : 'null'; // 'object'
```

#### Date、Array、RegExp、Function和Error类型的检测
这些类型用`typeof`检测都是"object"，所以需要用`Object.prototype.toString.call()`来检测

```javascript
var a = new Date(),
  b = [],
  c = /^\w+$/,
  d = function(){},
  e = new Error(),
  _toString = Object.prototype.toString.call;

_toString(a); // '[Object Date]'
_toString(b); // '[Object Array]'
_toString(c); // '[Object RegExp]'
_toString(d); // '[Object Function]'
_toString(e); // '[Object Error]'
```

#### 非内置对象
对于非内置对象，需要使用对象的`constructor`属性和`instanceof`运算符来实现

```javascript
function F1(){
  this.a = 'a';
}

var f1 = new F1();
f1 instanceof F1; // true
f1.constructor.name; // 'F1'
```
