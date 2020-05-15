/**
 * @description 按顺序同时执行n个promise，执行完继续加载新的内容，但是同时做多只能有n个在执行
 * @author ikrong.com
 */
class Queue {

    _num = 1
    _delay = 0
    _channel = []
    _time = 1

    _process = () => { }
    _getList = () => { }

    _datalist = []

    constructor(
        num,
        delay,
        process,
        getList,
    ) {
        this._num = num
        this._delay = delay
        this._process = process
        this._getList = getList

        this._channel = Array(this._num).fill()
    }


    start() {
        this._loop()
    }

    _isFech = false
    async _fetchList() {
        if (this._isFech) return
        this._isFech = true
        this._datalist = (await this._getList(this._time++)) || []
        this._isFech = false
    }

    _loop() {
        this._channel.map(async (item, i) => {
            if (!item) {
                if (!this._datalist.length) {
                    await this._fetchList()
                    if (!this._datalist.length) return
                }
                let data = this._datalist.shift()
                this._channel[i] = new Promise(async r => {
                    await this._exec(data)
                    setTimeout(() => {
                        r()
                        this._channel[i] = null
                        this._loop()
                    }, this._delay || 0);
                })
            }
        })
    }

    async _exec(data, err = 0) {
        try {
            await this._process(data)
        } catch (error) {
            return this._exec(data, ++err)
        }
    }

}