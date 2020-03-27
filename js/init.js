/*
 * @Author: huyanhai
 * @since: 2020-03-27 22:24:20
 * @LastAuthor: huyanhai
 * @lastTime: 2020-03-27 23:44:30
 * @FilePath: \open\js\init.js
 * @Description: 
 */
new Vue({
    el: '#app',
    data: function() {
        return {
            active: 1
        }
    },
    methods: {
        changeMode(index) {
            this.active = index;
        }
    }
})