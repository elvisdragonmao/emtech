def calculator():
    print("Python 計算機")

    while True:
        formula = input("請輸入運算式 (輸入 'exit' 離開): ")

        if formula.lower() == 'exit':
            print("再見！")
            break
        try:
            result = eval(formula)
            print(f"結果: {result}")
        except Exception as e:
            print(f"錯誤: {e}")

if __name__ == "__main__":
    calculator()
