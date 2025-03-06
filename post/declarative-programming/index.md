---
authors: elvismao
tags: [演算法，JavaScript, CSS, React, SQL]
categories: [程式開發]
date: 2025-03-02
description: 宣告式程式設計（Declarative Programming）是一種描述「要做什麼」而不是「怎麼做」的程式設計方式。
---

# 什麼是宣告式程式設計 Declarative Programming？

宣告式程式設計（Declarative Programming）是一種**描述「要做什麼」而不是「怎麼做」的程式設計方式**。與傳統的命令式（Imperative Programming）相比，宣告式程式設計更專注於描述結果，而非具體的執行步驟。

這種方式的主要特點是：

- **關注目標結果**，而不是執行的細節。
- **讓系統決定最佳的執行方式**，減少開發者手動處理細節的負擔。
- **通常使用純函數（pure functions）和不可變數據（immutable data）**，降低副作用。

舉一個例子，在我高一電腦課時寫的 [【C++】常見題目解答](/p/sysh_cpp) 裡面老師有一題是要讓我們寫一個程式從 1 加到 100，我直接 `cout << 5050;` 就過了，這就是宣告式程式設計的一個例子，我們只需要描述「要做什麼」，而不需要描述「怎麼做」。

## 宣告式 vs. 命令式的對比

再舉個正常點的例子，假設我們有一個數字陣列 `[1, 2, 3, 4, 5]`，我們想篩選出偶數。

### 命令式（Imperative）方式

```javascript
let numbers = [1, 2, 3, 4, 5];
let evens = [];

for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] % 2 === 0) {
        evens.push(numbers[i]);
    }
}

console.log(evens); // [2, 4]
```

這種方式明確規定了每一步要做什麼，例如用 `for` 迴圈遍歷陣列、使用 `if` 進行判斷、手動將符合條件的數字加入 `evens` 陣列。

### 宣告式（Declarative）方式

```javascript
let numbers = [1, 2, 3, 4, 5];
let evens = numbers.filter((n) => n % 2 === 0);

console.log(evens); // [2, 4]
```

這段程式碼只是描述「我們想篩選偶數」，並使用 `filter()` 方法來達成，**不需要手動迴圈與條件判斷**，程式碼更簡潔且易讀。

是不是很明顯地感受到宣告式程式設計的優勢了呢？像是我們在寫 C++ 題目時直接使用 `std::sort` 來排序，不但程式看起來簡潔許多，同時使用的演算法比你在用的 Bubble Sort 快多了呢！

## 宣告式程式設計的優勢

### 1. 提高可讀性

宣告式語法更接近人類的思維方式，使程式碼更易於理解。例如，使用 SQL 查詢資料庫：

```sql
SELECT name FROM students WHERE score > 90;
```

這比起手動遍歷資料庫、篩選符合條件的資料更容易理解。

### 2. 更容易維護與擴展

由於宣告式程式碼更關注「結果」，而不是具體的執行細節，因此修改程式時，較少影響到其他部分。

### 3. 減少副作用（Side Effects）

許多宣告式語言（如 Haskell、Elixir）強調**純函數（Pure Functions）**，避免改變全域變數或影響外部狀態，提高程式的可預測性。

### 4. 更容易進行並行與最佳化

許多宣告式語言與框架（例如 SQL、React、Hadoop）都可以讓系統自動進行最佳化，提升效能。

## 應用場景

### 1. SQL 資料庫查詢

```sql
SELECT * FROM users WHERE age > 18;
```

SQL 語言是宣告式的，我們只描述「要哪些資料」，資料庫引擎會自動決定最佳的搜尋方式。

### 2. React（前端 UI 框架）

```jsx
function App() {
    return <h1>Hello, World!</h1>;
}
```

React 允許開發者只需「描述 UI 的狀態」，而不需手動更新 DOM。

### 3. CSS 樣式設計

```css
button {
    background-color: blue;
    color: white;
}
```

CSS 只描述「按鈕應該是藍色的」，而不需要告訴瀏覽器「如何」改變顏色。

### 4. 函數式程式語言（Haskell、Elixir）

Haskell、Elixir 等語言強調使用純函數和不可變數據，使得程式更加宣告式。

## 宣告式程式設計的挑戰

雖然宣告式程式設計有很多優點，但也有一些挑戰：

1. **學習曲線較高**：某些宣告式概念（如 Monad、遞歸）對新手來說較難理解。
2. **不適用於所有場景**：某些低層級的系統開發（如作業系統、驅動程式）仍然需要命令式風格。
3. **可能有性能開銷**：由於宣告式程式可能會自動最佳化，有時效能可能不如手寫的命令式程式碼。

## 結論

宣告式程式設計是一種**更關注「結果」的程式設計方式**，能夠提升可讀性、降低副作用，並讓系統自動處理最佳化。

適合宣告式程式設計的場景包括 SQL 資料庫查詢、React 前端開發、CSS 樣式設計，以及函數式語言應用。

雖然宣告式程式設計不是萬能的，但在現代開發中，它已經成為不可或缺的工具。掌握這種思維方式，能讓你的程式碼更簡潔、可讀、易維護。

> 縮圖背景來自 [Annie Spratt on Unsplash](https://unsplash.com/photos/white-and-brown-composite-bow-jY9mXvA15W0)。
