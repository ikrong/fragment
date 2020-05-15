/**
 * @description fetch获取下载进度
 * @author ikrong.com
 */

function fetchProgress(progress = () => { }, response = new Response) {
    let total = +response.headers.get('content-length') || 0
    let streamReader = response.body.getReader()
    let loaded = 0
    return new Response(
        new ReadableStream({
            start: (ctrl) => {
                async function read() {
                    try {
                        let { done, value } = await streamReader.read()
                        if (done) {
                            loaded = 100
                            progress(100)
                            ctrl.close()
                        } else {
                            loaded += value.byteLength
                            progress(+Number(loaded * 100 / total).toFixed(0))
                            ctrl.enqueue(value)
                            read()
                        }
                    } catch (error) {
                        ctrl.error(error)
                    }
                }
                read()
            }
        }),
        {
            headers: response.headers,
        }
    )
}

fetchProgress.replaceFetch = function () {
    let oriFetch = window.fetch
    window.fetch = (...args) => {
        let progress = args.slice(-1)[0]
        let ori = oriFetch(...args)
        if (typeof progress == 'function') {
            return ori.then(fetchProgress.bind(null, progress))
        } else {
            return ori
        }
    }
}