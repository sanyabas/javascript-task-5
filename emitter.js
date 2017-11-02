'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {

        _events: [],

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} emitter
         */
        on: function (event, context, handler) {
            this._events.push({
                event, context, handler: function () {
                    return handler.call(context);
                }
            });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} emitter
         */
        off: function (event, context) {
            const childEventsReg = new RegExp(`^${event}[.]([a-zA-Z.]+)`);

            function shouldBeDeleted(obj) {
                return obj.context === context &&
                    (obj.event === event || childEventsReg.test(obj.event));
            }

            const objectsToDelete = this._events.filter(shouldBeDeleted);
            for (const obj of objectsToDelete) {
                const indexToSplice = this._events.indexOf(obj);
                if (indexToSplice === -1) {
                    throw new RangeError();
                }
                this._events.splice(indexToSplice, 1);
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} emitter
         */
        emit: function (event) {
            let parts = event.split('.');
            while (parts.length) {
                const curEvent = parts.join('.');
                this._events
                    .filter(obj => obj.event === curEvent)
                    .forEach(obj => obj.handler());
                parts.pop();
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} emitter
         */
        several: function (event, context, handler, times) {
            if (times <= 0) {
                this.on(event, context, handler);
            }

            this.on(
                event, context, () => {
                    if (times > 0) {
                        handler.call(context);
                    }
                    times--;
                }
            );

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} emitter
         * @param {Number} frequency – как часто уведомлять
         */
        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                this.on(event, context, handler);
            }

            let counter = 0;
            this.on(event, context, () => {
                if (counter % frequency === 0) {
                    handler.call(context);
                }
                counter++;
            });

            return this;
        }
    };
}
