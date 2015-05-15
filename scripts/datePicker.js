
function DatePicker(imgUrl) {

    Element.prototype.append = function (elements) {
        for (var a = 0; a < elements.length; a++) {
            this.appendChild(elements[a]);
        }
    }

    Element.prototype.setStyles = function (styleObj) {
        for (var style in styleObj) {
            this.style[style] = styleObj[style];
        }
    }

    var div = document.createElement('div'),
        monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekDaysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        yy = new Date().getFullYear(),
        mm = new Date().getMonth(),
        dd = new Date().getDate(),
        currentYY = yy,
        currentMM = mm,
        currentDD = dd;
    div.setStyles({
        float: 'left', display: 'inline-block', fontFamily: 'Calibri',
        color: '#eeeeee', boxSizing: 'border-box', border: '1px solid transparent'
    });

    function DatePicker() {

        //this.yy = new Date().getFullYear();
        //this.mm = new Date().getMonth();
        //this.dd = new Date().getDate();
        this.mainContainer = this.createMainContainer();
        this.navigationRow = this.createNavigationRow();
        this.dateOptionsBox = this.createDateOptionsBox();

        this.mainContainer.append([this.navigationRow, this.dateOptionsBox]);

        document.body.appendChild(this.mainContainer);
    };

    DatePicker.prototype = {

        createMainContainer: function () {
            var mainContainer = div.cloneNode(true);
            mainContainer.setStyles({
                position: 'absolute', width: '250px', textAlign: 'center',
                display: 'none', border: '10px solid #333333',
                backgroundColor: '#333333', fontSize: '13px',
                padding: '0px'
            });

            return mainContainer;
        },

        createNavigationRow: function () {
            var self = this,
                navigationRow = div.cloneNode(true),
                header = div.cloneNode(true),
                arrowBtn = div.cloneNode(true);
            arrowBtn.setStyles({ cursor: 'pointer', width: '15%' });

            var leftArrow = arrowBtn.cloneNode(true),
                rightArrow = arrowBtn.cloneNode(true);
            leftArrow.innerHTML = '&#9664;';
            rightArrow.innerHTML = '&#9654;';
            leftArrow.onclick = function (ev) {
                self.arrowEvent('backward');
            };
            rightArrow.onclick = function (ev) {
                self.arrowEvent('forward');
            };

            header.innerHTML = monthNames[mm] + ' - ' + yy;
            header.setStyles({ cursor: 'pointer', width: '70%' });
            header.setAttribute('header-type', 'days');
            header.onclick = function () {
                self.headerEvent(header);
            }
            navigationRow.setStyles({ width: '100%', borderBottom: '1px solid #ffffff' });
            navigationRow.append([leftArrow, header, rightArrow]);
            return navigationRow;
        },

        createDateOptionsBox: function () {
            var self = this,
                dateOptionsBox = div.cloneNode(true);

            dateOptionsBox.innerHTML = this.generateDaysOfMonth();
            dateOptionsBox.id = 'date-options-box';
            dateOptionsBox.onclick = function (ev) {
                if (ev.target.getAttribute('cell-type') != 'active') {
                    return;
                }
                self.dateOptionsEvent(ev.target, self);
            }
            return dateOptionsBox;
        },

        attachTo: function (element) {
            var self = this,
                relativeParent = this.findRelativeParent(element),
                imgSize = element.offsetHeight - 5,
                imgPosition = element.offsetWidth - (imgSize + 7),
                imgStartX = imgPosition + element.offsetLeft + relativeParent.left,
                imgEndX = imgStartX + imgSize,
                imgStartY = element.offsetTop + relativeParent.top,
                imgEndY = imgStartY + element.offsetHeight;
            element.style.background = 'url(' + (imgUrl ? imgUrl : 'calendar.png') + ') no-repeat ' + imgPosition + 'px 0px';
            element.style.backgroundSize = imgSize + 'px ' + imgSize + 'px';

            element.onfocus = function (ev) {
                self.activeInput = this;
            }

            element.onclick = function (ev) {
                if (ev.pageX > imgStartX && ev.pageX < (imgEndX + 3) &&
                    ev.pageY > imgStartY && ev.pageY < imgEndY) {
                    if (self.mainContainer.style.display == 'none') {
                        var left = element.offsetLeft + relativeParent.left,
                            top = (element.offsetTop + element.offsetHeight) + relativeParent.top;
                        self.mainContainer.setStyles({
                            display: 'inline-block',
                            left: left + 'px',
                            top: top + 'px'
                        });
                        var activeDate = self.activeInput.value.split('-').filter(Boolean);
                        if (activeDate.length) {
                            self.setInputDate(activeDate);
                        }
                        else {
                            self.resetDate();
                        }
                        self.setCurrentDate();
                        self.dateOptionsBox.innerHTML = self.generateDaysOfMonth();
                        self.navigationRow.children[1].innerHTML = monthNames[mm] + ' - ' + yy;
                    }
                    else {
                        self.mainContainer.style.display = 'none';
                    }
                }
            }

            element.onmousemove = function (ev) {
                if (ev.pageX > imgStartX && ev.pageX < (imgEndX + 3) &&
                    ev.pageY > imgStartY && ev.pageY < imgEndY) {
                    this.style.cursor = 'pointer';
                }
                else {
                    this.style.cursor = 'initial';
                }
            }
        },

        arrowEvent: function (timeDirection) {
            var header = this.navigationRow.children[1],
                headerType = header.getAttribute('header-type'),
                direction = (timeDirection == 'backward') ? -1 : 1;
            if (headerType == 'days') {
                mm += direction;
                if (mm > 11) {
                    mm = 0;
                    yy += 1;
                }
                else if (mm < 0) {
                    mm = 11;
                    yy -= 1;
                }
                this.dateOptionsBox.innerHTML = this.generateDaysOfMonth();
                header.innerHTML = monthNames[mm] + ' - ' + yy;
            }
            else if (headerType == 'months') {
                yy += direction;
                header.innerHTML = yy;
                this.dateOptionsBox.innerHTML = this.generateMonths();
            }
            else {
                var years = header.innerHTML.split(' - '),
                    startYear = (timeDirection == 'backward') ? Number(years[0]) - 15 : Number(years[1]);
                header.innerHTML = startYear + ' - ' + (startYear + 15);
                this.dateOptionsBox.innerHTML = this.generateYears(startYear, startYear + 15);
            }
        },

        headerEvent: function (header) {
            var headerType = header.getAttribute('header-type');
            if (headerType == 'days') {
                header.innerHTML = yy;
                header.setAttribute('header-type', 'months');
                this.dateOptionsBox.innerHTML = this.generateMonths();
            }
            else if (headerType == 'months') {
                var startYear = (yy - 8);
                header.innerHTML = startYear + ' - ' + (startYear + 15);
                header.setAttribute('header-type', 'years');
                this.dateOptionsBox.innerHTML = this.generateYears(startYear, (startYear + 15));
            }
            else {
                header.innerHTML = yy;
                header.setAttribute('header-type', 'months');
                this.dateOptionsBox.innerHTML = this.generateMonths();
            }
        },

        dateOptionsEvent: function (element, mainContainer) {
            var header = this.navigationRow.children[1],
                headerType = header.getAttribute('header-type');
            if (headerType == 'days') {
                dd = Number(element.innerHTML);
                this.activeInput.value = dd + '-' + (mm + 1) + '-' + yy;
                this.mainContainer.style.display = 'none';
            }
            else if (headerType == 'months') {
                mm = monthNames.indexOf(element.innerHTML);
                header.innerHTML = monthNames[mm] + '-' + yy;
                header.setAttribute('header-type', 'days');
                this.dateOptionsBox.innerHTML = this.generateDaysOfMonth();
            }
            else {
                yy = Number(element.innerHTML);
                header.innerHTML = yy;
                header.setAttribute('header-type', 'months');
                this.dateOptionsBox.innerHTML = this.generateMonths();
            }
        },

        generateDaysOfMonth: function () {
            var daysOfMonth = new Date(yy, mm + 1, 0).getDate(),
                firstDayOfMonth = new Date(yy, mm, 1).getDay() - 1,
                lastDayOfMonth = new Date(yy, mm + 1, 0).getDay(),
                previousMonthDays = new Date(yy, mm, 0).getDate() - firstDayOfMonth,
                nextMonthStart = 1,
                daysWrapper = div.cloneNode(true),
                day = div.cloneNode(true);

            day.setStyles({ width: (100 / 7) + '%', padding: '1.5%' });

            for (var b = 0; b < 7; b++) {
                var weekDay = day.cloneNode(true);
                weekDay.innerHTML = weekDaysNames[b];
                daysWrapper.appendChild(weekDay);
            }

            for (var a = 0, len = firstDayOfMonth + daysOfMonth + (7 - lastDayOfMonth) ; a < len; a++) {
                var singleDay = day.cloneNode(true);
                if (a <= firstDayOfMonth || (a - firstDayOfMonth) > daysOfMonth) {
                    singleDay.innerHTML = a <= firstDayOfMonth ? previousMonthDays++ : nextMonthStart++;
                    singleDay.setStyles({ color: '#888888' });
                }
                else {
                    singleDay.innerHTML = a - firstDayOfMonth;
                    singleDay.setAttribute('cell-type', 'active');
                    singleDay.setStyles({ cursor: 'pointer' });
                    if (a - firstDayOfMonth == currentDD && mm == currentMM && currentYY == yy) {
                        singleDay.setStyles({ border: '1px solid #8FBF20', color: '#8FBF20' });
                    }
                }
                daysWrapper.appendChild(singleDay);
            }
            return daysWrapper.innerHTML;
        },

        generateMonths: function () {
            var wrapper = div.cloneNode(true),
                month = div.cloneNode(true);
            month.setStyles({ width: '25%', padding: '2%', cursor: 'pointer' });
            for (var a = 0; a < monthNames.length; a++) {
                var newMonth = month.cloneNode(true);
                newMonth.innerHTML = monthNames[a];
                newMonth.setAttribute('cell-type', 'active');
                if (a == currentMM && currentYY == yy) {
                    newMonth.setStyles({ border: '1px solid #8FBF20', color: '#8FBF20' });
                }
                wrapper.appendChild(newMonth);
            }
            return wrapper.innerHTML;
        },

        generateYears: function (startYear, endYear) {
            var wrapper = div.cloneNode(true),
                year = div.cloneNode(true);
            year.setStyles({ width: '25%', padding: '2%', cursor: 'pointer' });
            for (var a = startYear; a <= endYear; a++) {
                var singleYear = year.cloneNode(true);
                singleYear.innerHTML = a;
                singleYear.setAttribute('cell-type', 'active');
                if (a == currentYY) {
                    singleYear.setStyles({ border: '1px solid #8FBF20', color: '#8FBF20' });
                }
                wrapper.appendChild(singleYear);
            }
            return wrapper.innerHTML;
        },

        setInputDate: function (activeDate) {
            yy = Number(activeDate[2]);
            mm = Number(activeDate[1] - 1);
            dd = Number(activeDate[0]);
        },

        resetDate: function () {
            yy = new Date().getFullYear();
            mm = new Date().getMonth();
            dd = new Date().getDate();
        },

        setCurrentDate: function () {
            currentYY = yy;
            currentMM = mm;
            currentDD = dd;
        },

        holdReleaseEffect: function (element) {
            element.onmousedown = function () {
                var currentLineHeight = Number(this.style.lineHeight.slice(0, -2));
                this.style.lineHeight = (currentLineHeight + 2) + 'px';
            }
            element.onmouseup = function () {
                var currentLineHeight = Number(this.style.lineHeight.slice(0, -2));
                this.style.lineHeight = (currentLineHeight - 2) + 'px';
            }
        },

        findRelativeParent: function (element) {
            var parent = element.parentNode;

            while (parent.style.position != 'relative' && parent.tagName != 'BODY') {
                parent = parent.parentNode;
            }
            return {
                top: parent.offsetTop,
                left: parent.offsetLeft
            }
        }
    }

    return new DatePicker();
};




var datePicker = new DatePicker();

var inputs = document.querySelectorAll('input');
for (var a = 0; a < inputs.length; a++) {
    inputs[a].readOnly = 'true';
    datePicker.attachTo(inputs[a]);
}


