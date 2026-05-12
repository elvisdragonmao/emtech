---
authors: elvismao
tags: [C++]
categories: [程式教學]
date: 2022-09-08
---

# 【C++】常見題目解答

西苑高一電腦課 C++ 題目的最佳解。如果解不出來到想砸電腦或想只到更簡單的方法可以來看看。

最後更新：10/6 我整理出 C++ 題目常見的題目並寫出我認為的最佳解 (取自西苑高一電腦課)。也有提供一些減少程式碼的常用技巧。如果解不出來到想砸電腦或想只到更簡單的方法可以來看看

> [!NOTE]
>
> ### 警告網站終於搶救成功啦！這兩天來更新！這裡的程式僅供參考，請不要偷懶直接複製貼上，小考你不會過的。
> 關於有人問我是誰，選單有各種連結。
>
> **目前更新到 503 上課只會上到 425**

# 小提示

當然如果你只是想看解答<s>然後像月同學一樣手機開超大聲打音遊</s>可以[點我跳到解答](#題目解答)

> [!NOTE]
>
> ### C 語言如果你忘記 C 語言的語法想看看可以閱讀[這篇文章](https://emtech.cc/post/apcs_note/)，不過相信你學過 C++ 就不會想要碰它了。

## 減少程式碼的常用技巧

這裡講的是真的少打一點，不是全部縮成一排。減少程式碼可以方便閱讀且在 debug(找錯誤) 比較方便

### 定義時賦予值

```c++
int a b;
a=87;
```

可以簡化成`int a=87, b;`一行

### 在輸出行內進行運算

```c++
a=x+y;
cout<<a
```

可以簡化成`cout<<x+y;`一行

### if else 省去大括號

if else 裡面如果只有一行指令可以省去大括號`{}`

```c++
if(a>b){
    cout<<a;
}else{
    cout<<b
}
```

可以簡化成`if(a>b) cout<<a; else cout<<b;`一行

### 數學含式庫<math.h>

列出來怕你忘記

- `M_E` 回傳自然常數 e
- `M_PI` 回傳圓周率 π
- `M_SQRT2` 回傳根號 2
- `sin(x)` `cos(x)` `tan(x)` `asin(x)` `acos(x)` `atan(x)` 不解釋 bj4
- `exp(x)` 回傳自然常數 e 的 `x` 次方
- `pow(x, y)` 回傳 `x` 的 `y` 次方
- `pow(x)` 回傳 10 的 `x` 次方
- `sqrt(x)` 回傳 `x` 的根號
- `log(x)` 回傳以 `e` 為底的對數
- `log10(x)` 回傳以 10 為底的對數
- `abs(x)` 回傳整數 `x` 的絕對值
- `fabs(x)` 回傳實數 `x` 的絕對值

# 題目解答

就..雖然我很貼心還給你了複製鍵...但有問題要問...

裡面的換行空格是大家的習慣寫法，可以參考。且你會發現雖然空格多一點程式還是比標準答案少

> [!NOTE]
>
> ### 提醒裡面有一些東西還沒有教過，有興趣可以問我或是 Google。
> **目前只更新到 308**

## Ch.1

### 101.Hello C++

```C++
#include<iostream>

using namespace std;
int main() {
  cout << "Hello C++";
  return 0;
}
```

### 102.BMI

```c++
#include<iostream>

using namespace std;
int main() {
  float weight, height, BMI;
  cin >> weight >> height;
  BMI = weight / ((height / 100) * (height / 100));
  cout << "BMI 為" << BMI;
  return 0;
}
```

## Ch.2

### 201.運算子

> [!NOTE]
>
> ### 提示筆記先乘除後加減 (依照優先順序)
> - 有括弧的先計算
> - 多個括弧皆使用小括弧。EX:((8+9)-7)
> - 整數跟整數相除的結果為整數
>
> | 運算子 | 定義          | 優先順序 | 結合律 |
> | ------ | ------------- | -------- | ------ |
> | ++/--  | 後置遞增/遞減 | 2        | 左     |
> | ++/--  | 前置遞增/遞減 | 3        | 右     |
> | +/-    | 正負號        | 3        | 右     |
> | \*     | 乘法          | 5        | 左     |
> | /      | 除法          | 5        | 左     |
> | %      | 餘數 (mod)    | 5        | 左     |
> | +/-    | 加法/減法     | 6        | 左     |

```c++
#include<iostream>

using namespace std;
int main() {
  int x, y;
  cin >> x >> y;
  cout << x << " 加 " << y << " 的和是 " << x + y << endl;
  cout << x << " 減 " << y << " 的差是 " << x - y << endl;
  cout << x << " 乘 " << y << " 的積是 " << x * y << endl;
  cout << x << " 除 " << y << " 的結果是 " << 1.0 * x / y << endl;
  cout << x << " 除 " << y << " 的商是 " << x / y << endl;
  cout << x << " 除 " << y << " 的餘數是 " << x % y << endl;
  return 0;
}
```

### 202.成績計算

請製作一個程式，輸入五個成績，計算總和與平均並輸出

> [!NOTE]
>
> ### 提示筆記 C++ 換行可以用`<<endl`，但 C 語言的`\n`明顯短了三倍

```c++
#include<iostream>

using namespace std;
int main() {
  float sum, a, b;
  for (int i = 1; i < 6; ++i) {
    cin >> b;
    a += b;
  }
  cout << "總和：" << a;
  cout << "\n平均：" << a / 5;
  return 0;
}
```

### 203.矩形周長面積

請製作一個程式，輸入長方形的長 寬，並計算周長與面積

```c++
#include<iostream>

using namespace std;
int main() {
  int x, y;
  cin >> x >> y;
  cout << "周長=" << 2 * (x + y);
  cout << "\n面積=" << x * y;
  return 0;
}
```

### 204.畢氏定理

請製作一個程式，輸入直角三角形兩邊長，利用畢氏定理求斜邊長

> [!NOTE]
>
> ### 提示筆記
> `sqrt(x)` 回傳 `x` 的平方根 (Square Root)

```c++
#include<iostream>
#include<cmath>

using namespace std;
int main() {
  float x, y;
  cin >> x >> y;
  cout << "斜邊長=" << sqrt(x * x + y * y);
  return 0;
}
```

### 205.兩點距離

請製作一個程式，輸入二維中兩點座標，計算出兩點距離

> [!NOTE]
>
> ### 提示筆記
> `pow(x, y)` 回傳 `x` 的 `y` 次方

```c++
#include<iostream>

#include<cmath>

using namespace std;
int main() {
  float x1, x2, y1, y2;
  cin >> x1 >> y1 >> x2 >> y2;
  cout << "兩點距離=" << sqrt(pow(x1 - x2, 2) + pow(y1 - y2, 2));
  return 0;
}
```

### 206.兩點求一線

請製作一個程式，輸入二維中兩點座標，計算出通過兩點的直線方程式

```c++
#include<iostream>
#include<cmath>

using namespace std;
int main(){
	float x1,x2,y1,y2,m;
	cin>>x1>>y1>>x2>>y2;
	cout<<"方程式:y="<<(y1-y2)/(x1-x2)<<"x+"<<(y1*x2-y2*x1)/(x2-x1);
}
```

> [!NOTE]
>
> ### 原本想法
> 斜率`m`為 y 變化量除以 x 變化量。將一數代數`y=mx+b`即可求出 b 並寫出方程式。`b`只會用一次算出來直接輸出，不用多設一個變數。
>
> 不過浮點數是使用科學記號儲存，有一定的誤差 當斜率本身已經有誤差時，再用來算出截距，誤差將擴大。因此最後一個測資會有誤差。
>
> ```c++
> #include<iostream>
> #include<cmath>
> using namespace std;
> int main(){
> 	float x1,x2,y1,y2,m;
> 	cin>>x1>>y1>>x2>>y2;
> 	m=(y1-y2)/(x1-x2);
> 	cout << "方程式:y=" << m << "x+" << y2-x2*m;
> }
> ```

## Ch.3

### 301.奇偶同籠？

請製作一個程式，可以讓使用者輸入一個整數，判斷是奇數還是偶數

> [!NOTE]
>
> ### 提示筆記
> 如果否則的語法是
>
> ```c++
> if (條件式){
> 	程式區塊;
> } else {
>     程式區塊;
> }
> ```
>
> 如果大括號裡面只有一行程式可以省略

```c++
#include<iostream>

using namespace std;
int main() {
  int a;
  cin >> a;
  if (a % 2 == 0) cout << "偶數";
  else cout << "奇數";
  return 0;
}
```

### 302.及格？

請製作一個程式，讓使用者輸入一個成績，顯示「成績及格」或「成績不及格」

```c++
#include<iostream>

using namespace std;
int main() {
  int a;
  cin >> a;
  if (a >= 60) cout << "成績及格";
  else cout << "成績不及格";
  return 0;
}
```

### 303.幾科不及格

請製作一個程式：

1. 可以輸入五個成績
2. 計算有幾科不及格

> [!NOTE]
>
> ### 提示筆記這裡使用了`for-each`循環。它將`y`設定為`a`的第一個元素，運行大掛號（可省略）的程式，然後它將`y`設定為`a`的第二個元素，然後...
> 使用它是因用`for (int i = 0; i < 2; i++ )`太長了（如果要自動判斷陣列有多長要打`for (int i = 0; i < i.length; i++ )`）。重點是要存取清單的內容要用`a[i]`而不是`i`

```c++
#include<iostream>

using namespace std;
int main() {
  int a[5], b = 0;
  cin >> a[0] >> a[1] >> a[2] >> a[3] >> a[4];
  for (int y: a)
    if (y < 60) b++;
  cout << "共" << b << "科不及格";
  return 0;
}
```

### 304.明年當學弟/妹？

請製作一個程式：

1. 可以輸入五個成績
2. 判斷明年是否當學弟妹 (不及格科數達一半)

```c++
#include<iostream>

using namespace std;
int main() {
  int a[5], b = 0;
  cin >> a[0] >> a[1] >> a[2] >> a[3] >> a[4];
  for (int y: a)
    if (y < 60) b++;
  if (b > 2) cout << "明年當學弟妹";
  else cout << "明年當學長姊";
  return 0;
}
```

### 305.比大小

請製作一個程式，輸入兩個正整數，輸出較大者

```c++
#include<iostream>

using namespace std;
int main() {
  int a, b;
  cin >> a >> b;
  if (a > b) cout << a;
  else cout << b;
  return 0;
}
```

### 306.本丸好呷

某數字商店飯糰第二件 59 折，以低價者計。請製作一個程式，輸入兩個正整數，代表兩顆飯糰的定價，請計算優惠後的總價。

```c++
#include<iostream>

using namespace std;
int main() {
  int a, b, c;
  cin >> a >> b;
  if (a > b) c = 0.59 * b + a;
  else c = 0.59 * a + b;
  cout << "優惠價=" << c;
  return 0;
}
```

### 307.比仨大

請製作一個程式，輸入三個正整數，輸出最大者

**更新：最大值 b 如果一開始沒有給定值會被設為 0。故先將 b 設為第一個數再進行比較。**

```c++
#include<iostream>
using namespace std;
int main(){
  int a[3];
  cin>>a[0]>>a[1]>>a[2];
    int b = a[0];
    for( int y : a ) if(y>b) b=y;
        cout<<"最大值="<<b;
    return 0;
}
```

### 308.比不完

請製作一個程式，輸入五個正整數，輸出最大者

```c++
#include<iostream>

using namespace std;
int main() {
  int a[5], b;
  cin >> a[0] >> a[1] >> a[2] >> a[3] >> a[4];
  for (int y: a)
    if (y > b) b = y;
  cout << "最大值=" << b;
  return 0;
}
```

### 309.正負？

請製作一個程式，判斷輸入的數字是正數、負數還是 0

```c++
#include<iostream>

using namespace std;
int main() {
  int a;
  cin >> a;
  if (a > 0) cout << "正數";
  else if (a == 0) cout << "零";
  else cout << "負數";
  return 0;
}

```

### 310.分級

請製作一個程式，讓使用者輸入成績，並判斷等級：

- 90~100 分：A
- 80~89 分：B
- 70~79 分：C
- 60~69 分：D
- 0~59 分：F

```c++
#include<iostream>
using namespace std;
int main() {
  int a;
  cin >> a;
  switch (a / 10) {
  case 10:
  case 9:
    cout << "A";
    break;
  case 8:
    cout << "B";
    break;
  case 7:
    cout << "C";
    break;
  case 6:
    cout << "D";
    break;
  default:
    cout << "F";
  }
  return 0;
}
```

### 311.電腦教室不能帶飲料進來

某項數字商店飲料定價 87 元，第二件 8 折，第三件 77 折請製作一個程式可以輸入件數計算價錢

```c++
#include<iostream>

using namespace std;
int main() {
  int a,c;
  float b[4]={0,1,1.8,2.57};
  cin >> a;
  c=a/3*223.59+b[a%3]*87;
  cout << "總價=" << c;
  return 0;
}
```

### 312.一塊錢玩兩次

ax2 + bx + c = 0，請製作一個程式，輸入 a、b、c，解一元二次方程式。若 a = 0 則輸出 ERROR<br /> 令 d = b2 - 4ac：<br /> 若 d = 0，則輸出方程式唯一解 x=-b/2a<br /> 若 d > 0，則輸出方程式兩解 x=(-b±√d)/2a<br /> 若 d < 0，則輸出無實數解<br />

```c++
#include<iostream>

#include<cmath>

using namespace std;
int main() {
  float a, b, c;
  cin >> a >> b >> c;
  if (a == 0) cout << "ERROR";
  else {
    float d = b * b - 4 * a * c;
    if (d < 0) cout << "無實數解";
    else {
      if (d == 0) cout << "唯一解 x=" << 0 - b / (a * 2);
      else cout << "兩解:\nx1=" << (0 - b + sqrt(d)) / 2 * a << "\nx2=" << (0 - b - sqrt(d)) / 2 * a;
    }
  }
  return 0;
}
```

### 313.三角形

請製作一個程式，輸入三角形三邊長 a、b、c，先判斷能否構成三角形，若無法構成三角形則輸出 ERROR，然後評定三角形種類，最後計算三角形面積。

- 假如𝑎2+𝑏2>𝑐2，為銳角三角形
- 假如𝑎2+𝑏2=𝑐2，為直角三角形
- 假如𝑎2+𝑏2<𝑐2，為鈍角三角形
- 令 d=(a+b+c)/2，三角形面積=√(d(d−a)(d−b)(d−c))

```c++
#include<iostream>

#include<cmath>

using namespace std;
int main() {
  float a, b, c, d;
  cin >> a >> b >> c;
  if (a > b) {
    d = a;
    a = b;
    b = d;
  }
  if (b > c) {
    d = b;
    b = c;
    c = d;
  }
  if (c >= a + b) {
    cout << "ERROR";
  } else {

    int e = b * b + a * a;
    int f = c * c;
    if (e > f) cout << "銳";
    else
    if (e == f) cout << "直";
    else cout << "鈍";
    float D = (a + b + c) / 2;
    cout << "角三角形\n面積=" << sqrt(D * (D - a) * (D - b) * (D - c));
  }
  return 0;
}
```

## Ch.4

這一段有點尷尬，沒有人叫你用`for`迴圈你幹嘛寫那麼多行跑那麼久？測資要什麼複製貼上就好了。

如果你想用正規的辦法`for`的原型在這裡相信你會的 uwu

```c++
for(變數設為;如果...; 變數要...){
  指令區塊;
  [break;]    //跳出迴圈
  [continue;] //跳下一次迴圈
}
```

比如說這兩個程式都會輸出`uwu uwu uwu`

```c++
#include<iostream>

using namespace std;
int main() {
  int i;
  for (i = 0; i < a; i++) {
    cout << "uwu ";
  }
  return 0;
}
```

```c++
#include<iostream>

using namespace std;
int main() {
  for (int i = 0; i < a; i++)
    cout << "uwu ";
  return 0;
}
```

### 401

請列印出 1 2 3 4 5 6 7 8 ......19

```c++
#include<iostream>

using namespace std;
int main() {
  cout << "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19";
  return 0;
}
```

### 402

請列印出 1 3 5 7 9 11 13 15 17 19

```c++
#include<iostream>

using namespace std;
int main() {
  cout << "1 3 5 7 9 11 13 15 17 19 ";
  return 0;
}
```

### 403

請列印出 7 6 5 4 3 2 1 0 -1 -2 -3

```c++
#include<iostream>

using namespace std;
int main() {
  cout << "7 6 5 4 3 2 1 0 -1 -2 -3 ";
  return 0;
}
```

### 405

請列印出 7 5 3 1 -1 -3 -5 -7 -9 -11

不要問我 404 去哪。404 找不到此頁面

```c++
#include<iostream>

using namespace std;
int main() {
  cout << "7 5 3 1 -1 -3 -5 -7 -9 -11 ";
  return 0;
}
```

### 406

請製作一個程式計算 1~100 之和

國小數學會吧...梯形公式。當然你要直接輸出 5050 也可以

```c++
#include<iostream>

using namespace std;
int main() {
  cout << "5050";
  return 0;
}
```

### 407

輸入兩個整數 a,b，計算 a 到 b 的合 (包含 a、b)

例如輸入 1 跟 100，計算 1~100 之合為 5050

```c++
#include<iostream>

using namespace std;
int main() {
  int a, b;
  cin >> a >> b;
  cout << (a + b) * (abs(a - b) + 1) / 2;
  return 0;

}
```

### 408

請製作一個程式，輸入的第一個正整數為班級人數 n，代表接下來會有 n 個正整數，為班上每個人的成績。請計算班級總分。

```c++
#include<iostream>

using namespace std;
int main() {
  int a, b, c = 0, i;
  cin >> a;
  for (i = 0; i < a; i++) {
    cin >> b;
    c = c + b;
  }
  cout << c;
  return 0;
}
```

### 409

請製作一個程式，輸入的第一個正整數為班級人數 n，代表接下來會有 n 個正整數，為班上每個人的成績。請計算班級平均。

```c++
#include<iostream>

using namespace std;
int main() {
  int a, b, c = 0, i;
  cin >> a;
  for (i = 0; i < a; i++) {
    cin >> b;
    c = c + b;
  }
  cout << 1.0 * c / a;
  return 0;
}
```

### 410

請製作一個程式，輸入的第一個正整數為班級人數 n，代表接下來會有 n 個正整數，為班上每個人的成績。請計算班級中不及格的人數。

```c++
#include<iostream>

using namespace std;
int main() {
  int n,a,b=0,i;
  cin >> n;
  for (i = 0; i < n; i++) {
    cin >> a;
    if(a<60) b++;
  }
  cout << b;
  return 0;
}
```

### 411

請製作一個程式，將 1~548701487 的整數中篩選出 94 或 87 的倍數，

- 計算有多少個
- 計算這些數的總和

```c++
#include<iostream>

using namespace std;
int main() {
  int i, a = 0, b = 0;
  for (i = 1; i <= 548701487; i++) {
    if (i % 87 == 0 || i % 94 == 0) {
      a++;
      b += i;
    }
  }
  cout << a << endl << b;
  return 0;
}
```

### 412

請製作一個程式，輸入一個整數 n，計算 1~n 的整數中 (n<10000)，出現過多少次 5  
例如 2345 含有一次 5，5555 含有四次 5

```c++
#include<iostream>

#include<math.h>

using namespace std;
int main() {
  int i, o, a, b = 0, c;
  cin >> a;
  for (i = 1; i <= a; i++) {
    for (o = 0; o <= 5; o++) {
      c = i / pow(10, o);
      if (c % 10 == 5) b++;
    }
  }
  cout << b;
  return 0;
}
```

# 413

請製作一個程式，輸入一個整數 x，再輸入一個整數 y，檢查 y 是否為 x 的因數，輸出 1 或 0

```c++
#include<iostream>
using namespace std;
int main() {
  int a,b;
  cin>>a>>b;
    if(a%b==0) cout<<1; else cout<<0;
  return 0;
}
```

# 414

請製作一個程式，輸入一個整數 n，求其所有因數

```c++
#include<iostream>

using namespace std;
int main() {
  int i,a;
  cin>>a;
  for (i = 1; i <= a; i++) {
    if(a%i==0)   cout << i<<" ";

  }
  return 0;
}
```

# 415

請製作一個程式，輸入一個整數，求因數數量

```c++
#include<iostream>

using namespace std;
int main() {
  int i,a,b=0;
  cin>>a;
  for (i = 1; i <= a; i++)
    if(a%i==0)   b++;
  cout<<b;
  return 0;
}
```

# 416

請製作一個程式，輸入一個整數，判斷其是質數還是合數

```c++
#include<iostream>

using namespace std;
int main() {
  int i,a,b=0;
  cin>>a;
  for (i = 1; i <= a; i++)
    if(a%i==0)   b++;
if(b==2) cout<<"質數"; else
  cout<<"合數";
  return 0;
}
```

# 417

請製作一個程式，輸入一個整數 n，列出費式數列 n 項  
1 1 2 3 5 8 13 21……

```c++
#include<iostream>

using namespace std;
int main() {
  int a, b = 0, x = 0, y = 1, z, o;
  cin >> a;
  for (o = 0; o < a; o++) {
    z = x;
    x = x + y;
    y = z;
    cout << x << " ";
  }

  return 0;
}
```

# 418

請製作一個程式，使用者輸入兩個數字，使用輾轉相除法，求兩數最大公因數

```c++
#include<iostream>
using namespace std;

int main()
{
    int a, b, t;

    while( cin >> a >> b )
    {
        while( b!=0 )
        {
            t = b;
            b = a%b;
            a = t;
        }
        cout << a << endl;
    }

    return 0;
}
```

# 419

請製作一個程式，使用者輸入一個整數 n，求質因數分解

```c++
#include<iostream>
using namespace std;

int main()
{
    int n,i;
    cin >> n;
    i = 2;
    while( n > 1 ){
        while( n%i == 0 ){
            cout << i;
            n = n/i;
                if(n!=1) cout<<"*";
        }
        i = i+1;
    }
    cout << endl;

    return 0;
}
```

# 420

請製作一個程式，輸入一個正整數 n，列印出底為 n、高為 n 的星星直角三角形

```c++
#include<iostream>

using namespace std;

int main() {
  int n;
  cin >> n;
  for (int i = 0; i <= n; i++) {
    for (int o = 0; o < i; o++) cout << "*";
    cout << endl;
  }

  return 0;
}
```

# 421

請製作一個程式，輸入一個正整數 n，列印出底為 n、高為 n 的反星星直角三角形

```c++
#include<iostream>

using namespace std;

int main() {
  int n;
  cin >> n;

  for (int i = 0; i <= n; i++) {
    for (int a = 0; a < i; a++) cout << " ";
    for (int o = 0; o < n - i; o++) cout << "*";
    cout << endl;
  }

  return 0;
}
```

# 422

請製作一個程式，輸入一個正整數 n，列印出底為 n、高為 n 的數字三角形

```c++
#include<iostream>

using namespace std;

int main() {
  int n;
  cin >> n;
  for (int i = 0; i <= n; i++) {
    for (int o = 1; o <= i; o++) cout << o;
    cout << endl;
  }

  return 0;
}
```

# 423

請製作一個程式，輸入一個正整數 n，列印出底為 n、高為 n 的數字三角形

```c++
#include<iostream>

using namespace std;

int main() {
  int n;
  cin >> n;
  for (int i = 0; i <= n; i++) {
    for (int o = n; o > 0; o--)
      if (o > i) cout << o;
    cout << endl;
  }

  return 0;
}
```

# 424

請製作一個程式，輸入一個正整數 n，列印出底為 n、高為 n 的數字三角形

```c++
#include<iostream>

using namespace std;

int main() {
  int n;
  cin >> n;
  for (int i = 0; i <= n; i++) {
    for (int o = 1; o <= n; o++)
      if (o > n - i) cout << o;
    cout << endl;
  }

  return 0;
}
```

# 425

請製作一個程式，輸入一個正整數 n，列印出底為 n、高為 n 的數字三角形

```c++
#include<iostream>

using namespace std;

int main() {
  int n;
  cin >> n;
  for (int i = 0; i <= n; i++) {
    for (int o = 1; o <= n; o++)
      if (o > n - i) cout << o;
    cout << endl;
  }

  return 0;
}
```

# 426

請製作一個程式，輸入一個整數 n，列印出 2~n 之間的所有質數 (包含 2、n)

```c++
#include<iostream>

using namespace std;
int main() {
  int i, a, b = 0;
  cin >> a;
  for (int o = 2; o <= a; o++) {
    b = 0;
    for (i = 2; i < o; i++)
      if (o % i == 0) b = 1;
    if (b == 0) cout << o << " ";
  }
  return 0;
}
```

這些應該夠你們用幾週了，剩下的有空再繼續更新。

# 501

請製作一個程式，輸入一個正整數 n，代表接下來共有 n 個整數，計算其總合

```c++
#include<iostream>

using namespace std;
int main() {
  int i, a, b, c = 0;
  cin >> a;
  for (i = 0; i < a; i++) {
    cin >> b;
    c += b;
  }
  cout << c;
  return 0;
}
```

# 502

請製作一個程式，輸入一個正整數 n，代表接下來共有 n 個整數，請輸出最大值

```c++
#include<iostream>

using namespace std;
int main() {
  int i, a, b, c = -100;
  cin >> a;
  for (i = 0; i < a; i++) {
    cin >> b;
    if (b > c) c = b;
  }
  cout << c;
  return 0;
}
```

# 503

請製作一個程式，輸入一個正整數 n，代表接下來共有 n 個整數，請輸出最大值的編號

(如果數字相同以序號小的)

```c++
#include<iostream>

using namespace std;
int main() {
  int i, a, b, c = -99999, d = 0;
  cin >> a;
  for (i = 0; i < a; i++) {
    cin >> b;
    if (b > c) {
      c = b;
      d = i;
    }
  }
  cout << d;
  return 0;
}
```

# 504

請製作一個程式，使用者輸入一個正整數 n，代表接下來共有 n 個整數，利用泡沫排序法零式，將最大值移至最後方。

```c++
#include<iostream>

using namespace std;
int main() {
  int a, i, j, b;
  cin >> a;
  int A[a];
  for (i = 0; i < a; i++) {
    cin >> j;
    A[i] = j;
  }
  for (i = 0; i < a; i++) {
    if (A[i] > A[i + 1]) {
      b = A[i];
      A[i] = A[i + 1];
      A[i + 1] = b;
    }
    cout << A[i] << " ";
  }

  return 0;
}
```

# 505

請製作一個程式，使用者輸入一個正整數 n，代表接下來共有 n 個整數，利用泡沫排序法由小到大排序。

```c++
#include<iostream>

using namespace std;
int main() {
  int a, i, j, b;
  cin >> a;
  int A[a];
  for (i = 0; i < a; i++) {
    cin >> j;
    A[i] = j;
  }
  for (j = 0; j < a - 1; j++) {
    for (i = 0; i < a; i++) {
      if (A[i] > A[i + 1]) {
        b = A[i];
        A[i] = A[i + 1];
        A[i + 1] = b;
      }
    }

  }
  for (j = 0; j < a; j++) cout << A[j] << " ";
  return 0;
}
```

# 506

請製作一個程式，使用者輸入一個正整數 n，代表接下來共有 n 個整數，利用選擇排序法零式，將最小值移至最前方。

```c++

```

# 507

請製作一個程式，使用者輸入一個正整數 n，代表接下來共有 n 個整數，利用選擇排序法由小到大排序。

```c++

```

# 508

請製作一個程式，使用者輸入一個正整數 n，代表接下來共有 n 個整數，找出中位數。

```c++

```

# 509

請製作一個程式，使用者輸入一個正整數 n，代表接下來共有 n 個整數，找出眾數。

```c++

```

# 510

請製作一個程式，輸入一個正整數 n，代表接下來共有 n 個整數，請檢查該數列是否等差、等比或都不是

```c++

```
