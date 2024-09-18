---
authors: elvismao
tags: [C]
categories: [筆記]
date: 2022-07-17
---

這是我自己學習的筆記，紀錄一些準備考試的重點，不適合新手閱讀

<!--more-->

{{% notice note "好久不見!" %}}
因為要準備會考已經非常久沒有發文了，不過這一篇是我自己寫的一些重點整理筆記，且會持續更新。程式語言教學只會寫C與其他語言不同的語法，適合已經對程式有概念的人閱讀。如果你對C語言有興趣可以參考[這個系列文章](https://ithelp.ithome.com.tw/users/20119869/ironman/4724)，我覺得寫得不錯w
{{% /notice %}}

# C規則

只寫和javascript不同的地方，或我自己覺得重要或會忘記的部分

## 函式Cool

通常會加入`stdio.h`和`stdlib.h`

- stdio.h
  - puts(char) - 將字串顯示到視窗上，自動換行
  - gets(char) - 透過鍵盤輸入**字串**
- stdlib.h
  - abs(int x) - 回傳整數 `x` 的絕對值
  - atoi(char) - 回傳字串轉整數的結果
  - strtof(char) -
  - 回傳字串轉 `float` 的結果
- [math.h](##數學<math.h>)
- string.h
  - strlen(s) - 回傳一個整數，是字串 `s` 的長度，長度的計算不包含字串結尾的 `'\0'`

## 輸出

```c
printf("字串");
printf("字串或格式代碼",var1,var2,var3);
puts("ABC");//自動換行，但沒有格式化字串的功能。只能顯示字串
```

- `\n`:換行
- `\t`:自動對齊
- `\a`: 鈴聲
- `\b`: 游標(下個文字開始顯示的位置)倒退一格
- `\r`: 游標倒退到這行的開頭

### 預留位置(Format placehold)

整數用 `%d`，浮點數用 `%f`，字元用 `%c`，字串用 `%s`

%hd, %d, %lld 都是將資料轉換成整數  
能處理的位數 %hd < %d < %lld

### 格式化字串

#### 最小長度

在 `%` 的後面加上數字，可以設定變數顯示的最小長度，如果長度不足會自動補空格，以達到對其的目的如`printf("%4d\n", a)`；在最小位數的前面加上0，會變成用0補齊長度如`printf("%07d\n", b);`

## 變數

### 型態

加上 `unsigned`，會變成只能表示正數和0，但範圍 **大小** 不變。如`unsigned char`的範圍是0~2^8

| 型態      | 說明         | 範圍         |
| --------- | ------------ | ------------ |
| long int  | 長整數       | ±21億        |
| int       | 整數         | ±21億        |
| short int | 短整數       | ±32768       |
| char      | 字元         | 0~255        |
| float     | 浮點數       | 1.2~3.4e±38  |
| double    | 倍精度浮點數 | 1.2~1.8e±308 |

你有沒有發現<s>可悲的</s>C語言中，並沒有 String 這個型別。需要使用[字元的陣列 (character Array)](###字元陣列 "character Array") 作為字串，而**空字元(`'\0'`)代表字串結束**
所以 `"123"`，其實是一個長度為四的一維字元陣列，它的元依序是 `'1'`, `'2'`, `'3'`, `'\0'`

### 宣告

以下4種方式都可以

```c
int x
int x=1
//一次多個
int x=1, y=10, z=100;
int x=y=z=100;
```

雖然沒有硬性規定，但C語言中可以用 `f`, `F` 標示數值是浮點數，整數時可以用 `.` 標示

### 指派/指定 運算子(Assignment Operator)

前面用過的 = 就是其中一種，執行時會先將等號右邊的值算出來，再指派給左邊的變數
`a=a+1`等效`a+=1`等效`a++`
`a=a-1`等效`a-=1`等效`a--`
`a=a*2`等效`a*=2`
`a=a/2`等效`a/=2`
`a=a%2`等效`a%=2`

### 輸入

```
//輸入整數、字元、浮點到變數x、y、z
scanf("%d%c%d", &x, &y, &z);
```

## 邏輯判斷

### if、switch、while、for

和js大同小異

```c
//if
if(ture){
	printf("yes");
}
else{
	printf("no");
}
//大括號內只有一行可省略大括號
if(x>100)
	printf("x is greater than 100.");

//switch
switch(x){
	case 0: case 7:
		printf("A\n");
		//x=0或是7都會印出A
		break;
	case 2: case 5:
		printf("B\n");
		break;
	case 4: case 3:
		printf("C\n");
		break;
	case 6: case 1:
		printf("D\n");
		break;
}

//while
while(ture){
	printf("forever printing");
}

//for 大括號內只有一行一樣可省略大括號
int i;
for(i=0; i!=5; i++)
	printf("%d", i);//輸出12345

```

{{% notice note "程式碼縮排" %}}
和js一樣沒有規定，不縮也可以  
通常以一個 Tab 鍵(在鍵盤左邊) 為單位，每多一個大括號，就多空一個單位。如果大括號被省略還是要縮排
{{% /notice %}}

### break & continue

- break: 強制結束迴圈
- continue: 跳過這次的區塊，但迴圈不會結束

## 陣列

以下是一些合法使用的例子

```c
int arrA[5];
int arr[]={12,22,3};
arr[2]=4;
arr[x]=y;
printf("%d\n", arr[0]);
```

### 字元陣列 (character Array)

AKA字串。可悲C

- 字元常數是用**單引號**括起來的一個字元，如'a'、'b'、'='、'+'、'?'
- 字串常數是由一對雙引號括起的字元序列，如"EM" ， “Oh yeah!” ， "$12.5"

字元常數'a'和字串常數"a"雖然都只有一個字元，但在記憶體中的情況是不同的。

| 輸入 | 記憶體   |
| ---- | -------- |
| 'a'  | `a`      |
| "a"  | `a` `\0` |

#### 宣告

```c
//可以用和陣列一樣的方法初始化字串的內容
char s[100]={'H', 'e', 'l', 'l', 'o', '!', '\0'};
//或是用雙引號代表字串，但一樣只能在宣告時用這個方法指派
char s[100]="Hello!";
//可把字串作為printf()的引數來印出字串
char s[100]="Hello!";
printf(s);
```

#### 輸出

```c
char s[100]="PJ";
printf("My name is %s.", s);
return 0;
```

#### 輸入

```c
char name[100];
scanf("%s", name);
printf("My name is %s.\n", name);
```

如果輸入的字串**包含空格**必須用 `%[^\n]`

```c
char name[100];
scanf("%[^\n]", name);
printf("My name is %s.\n", name);
```

####　常見字串處理

##### 字串長度

可用loop

```c
#include<stdio.h>

int main(){
	char s[100]="Hello!";
	int len=0;
	for(int i=0; s[i]!='\0'; i++)
		len++;
	printf("%d\n", len);
	return 0;
}
```

或透過函式庫`string.h`

## 定義

語法是:`#define <目標文字> <替換文字>`

用 `#define` 定義的函式，執行速度會比自訂函式還快，但函式功能複雜時不好編寫，且容易造成執行結果錯誤

```c
#include<stdio.h>
#define plus + //定義函式
#define x 1 //定義變數
#define y 2 //定義變數
#define say printf

int main(){
	say("%d\n", x plus y);
	return 0;
}
```

## 函式

```c
#include<stdio.h>
#include<stdlib.h>

int pi(){
    char say[3]="hi";
    showMessage(say);
    return 666;
}
void showMessage(a){
    printf(a);
}
int main(){
    printf("\n%d", pi());//輸出12345
    return 0;
}

```

## 建構式

### struct

```c
#include<stdio.h>
#include<stdlib.h>

struct STUDENT{
    int number;
    int age;
};

int main(){
	struct STUDENT student_1={87, 19};
	printf("I am %d,I'm %d years old",student_1.number,student_1.age);
    //I am 87,I'm 19 years old
}
```

### union

太廢了我也不知道拿來幹嘛

和 `struct` 一樣可以由多個不同型別的成員組成，但 **同一時間只能儲存一個資料**，或者可以說雖然可以用不同的成員名稱取得其中的資料，但實際上不管用哪個名稱都會得到同一個數值

```c
#include<stdio.h>
#include<stdlib.h>

union Data{
	int n;
	float f;
};

int main(){
	union Data data={5};
	printf("%d %f\n", data.n, data.f);
    //5 0.000000
}
```

### enum

```C
#include<stdio.h>
#include<stdlib.h>

enum week{A=1, B, C, D=1, E, F};

int main(){
	printf("%d %d %d %d %d %d", A, B, C, D, E, F);
    //1 2 3 1 2 3
	return 0;
}
```

## 關鍵字

以下這些字不能作為變數名稱

auto, do, goto, signed, break, double, if, sizeof, case, else, int, static, char, enum, long, struct, const, extern, register, switch, continue, float, return, typedef, default, for, short, union

## 科學記號

- 123=1.23E+2
- 0.00041=4.1e-4

## 數學<math.h>

- `M_E` 回傳自然常數 e
- `M_PI` 回傳圓周率 π
- `M_SQRT2` 回傳根號2
- `sin(x)` `cos(x)` `tan(x)` `asin(x)` `acos(x)` `atan(x)` BJ4
- `exp(x)` 回傳自然常數 e 的 `x` 次方
- `pow(x, y)` 回傳 `x` 的 `y` 次方
- `pow(x)` 回傳10的 `x` 次方
- `sqrt(x)` 回傳 `x` 的根號
- `log(x)` 回傳以 `e` 為底的對數
- `log10(x)` 回傳以10為底的對數
- `abs(x)` 回傳整數 `x` 的絕對值
- `fabs(x)` 回傳實數 `x` 的絕對值
