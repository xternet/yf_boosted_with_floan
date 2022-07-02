# Yield Farming on Compound boosted with dYdX flash loan

## 📃 Instructions to run
#### 0. **Install dependencies in project directory (works with node v12.10.0)**
```
npm i
```
#### 1. **Install ganache-cli (globaly)**
```
npm i -g ganache-cli
```
#### 2. **In 1st terminal window fork mainnet with ganache-cli**
```
ganache-cli -p 7545 -f <https://YOUR_ETH_PROVIDER>
```
#### 3. **In 2nd terminal window run tests**
```
trufle test
```
!Note: To reset data, restart ganache-cli after each test.
</br>
</br>
## 🔧 Deposit Diagram:
![Deposit Diagram](https://i.gyazo.com/77913f25dd333c7f8a9ea99813053c61.png)
</br>
## 🔧 Withdraw Diagram:
![Deposit Diagram](https://i.gyazo.com/3c5736a988fe92fc7bd3c373230c2663.png)
