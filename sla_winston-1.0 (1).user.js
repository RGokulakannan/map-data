// ==UserScript==
// @name         sla_winston
// @namespace    winston
// @version      1.0
// @description  Its all about winston hour check
// @author       rhgokula
// @match        https://eu.winston.a2z.com/EU/task/find*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @run-at		 document-end

// ==/UserScript==

/* globals $, moment */

(function() {
    'use strict';

    // Function to be executed every 10 seconds
    function countWeekends(startDate, endDate) {
        let count = 0;
        let currentDate = new Date(startDate);

        // Loop through each date in the range
        while (currentDate <= endDate) {
            const day = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
            if (day === 0 || day === 6) {
                count++;
            }
            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return count;
    }



    // Function to highlight the "Create On" cells
    function highlightCreateOn() {

        // Find the index of the "Create On" column
        const createdOnColumnIndex = Array.from(document.querySelectorAll('th[data-awsui-column-id]')).findIndex(
            (th) => th.getAttribute('data-awsui-column-id') === 'createdOn'
        );

        const taskTypeColumnIndex = Array.from(document.querySelectorAll('th[data-awsui-column-id]')).findIndex(
            (th) => th.getAttribute('data-awsui-column-id') === 'taskType'
        );

        const rangeCountColumnIndex = Array.from(document.querySelectorAll('th[data-awsui-column-id]')).findIndex(
            (th) => th.getAttribute('data-awsui-column-id') === 'rangeCount'
        );

        // Loop through the table rows
        const rows = document.querySelectorAll('tbody tr');



        rows.forEach((row) => {
            // Get the due date cell
            let createdOnCell = row.querySelectorAll('td')[createdOnColumnIndex];

            // Get the Task Type
            let taskTypeOnCell = row.querySelectorAll('td')[taskTypeColumnIndex];

            // Get the range count
            let rangeCountOnCell = row.querySelectorAll('td')[rangeCountColumnIndex];

            let createOnBlock = createdOnCell.querySelector('div');


            // Check if the due date cell exists
            if (createdOnCell) {
                const createdOnText = createdOnCell.textContent.trim();
                const taskTypeOnText = taskTypeOnCell.textContent.trim();
                const rangeCountOnText = rangeCountOnCell.textContent.trim();

                // Parse the due date string into a Date object
                const createdOn = new Date(createdOnText);

                // Get the current date and time
                let currentDateTime = new Date();

                // get the number of weekend
                const weekendCount = countWeekends(createdOn, currentDateTime);

                // Subtract 5 days
                currentDateTime.setDate(currentDateTime.getDate() - weekendCount);

                // Calculate the time difference in hours
                let timeDiffInHours = (currentDateTime - createdOn ) / (1000 * 60 * 60);


                if ( taskTypeOnText in sla ) {
                    let remain_per = 150
                    let slaTime = 350
                    let colo = 'white'

                    let rangeCount = rangeCountOnCell.textContent.split('-')[1]

                    rangeCount = parseInt(rangeCount, 10);

                    if ( rangeCount <100 ) {
                        slaTime = sla[taskTypeOnText][0]
                    }

                    else if ( rangeCount >99 && rangeCount <500 ) {
                        slaTime = sla[taskTypeOnText][1]
                    }

                    else if ( rangeCount >499 && rangeCount <1001 ) {
                        slaTime = sla[taskTypeOnText][2]
                    }

                    else {
                        console.log(taskTypeOnText, rangeCountOnText, 'We cant find sla')
                    }

                    if ( timeDiffInHours < slaTime ) {
                        remain_per = timeDiffInHours/slaTime *150
                        colo = 'green'
                        if ( (slaTime - timeDiffInHours)<4 ){
                            colo = 'orange'
                        }
                    }
                    else {
                        colo = 'red'
                    }



                    if ( createdOnCell.querySelectorAll('div').length == 0 )
                    {

                        // Create the inner div to represent 50% fill
                        let fillDiv = document.createElement('div');
                        fillDiv.style.backgroundColor = colo;  // Set the background color to red
                        fillDiv.style.height = '8px';  // Set the background color to red
                        fillDiv.style.width = remain_per + 'px';


                        // Append the fillDiv to the cell
                        createdOnCell.appendChild(fillDiv);
                    }

                    else
                    {
                        createOnBlock.style.backgroundColor = colo ;
                        createOnBlock.style.width = remain_per + 'px';
                    }

                }

                if ( fastTrack.includes(taskTypeOnText)){

                    let currentHour = createdOn.getHours();

                    if (currentHour < 13) {
                        // If the current time is before 1 PM, set time to 1 PM
                        createdOn.setHours(13, 0, 0, 0); // 1 PM
                    } else if (currentHour > 17) {
                        // If the current time is after 6 PM, set time to 11 AM the next day
                        createdOn.setDate(createdOn.getDate() + 1); // Move to the next day
                        createdOn.setHours(13, 0, 0, 0); // 1 PM
                    }
                    let day = createdOn.getDay();
                    // If it's Saturday (6), move to Monday (next working day)
                    if (day === 6) {
                        createdOn.setDate(createdOn.getDate() + 2); // Move to Monday
                    }
                    // If it's Sunday (0), move to Monday
                    else if (day === 0) {
                        createdOn.setDate(createdOn.getDate() + 1); // Move to Monday
                    }

                    createdOn.setHours(createdOn.getHours() + 4);
                    let now = new Date();

                    let timeDiffInHours = (createdOn - now)/(1000*60*60)
                    let colo = 'yellow'
                    let remain_per = 150

                    if ( timeDiffInHours < 4 )
                    {
                        colo = 'green'
                        remain_per = 150*( 1 - (timeDiffInHours/4 ))

                        if ( timeDiffInHours < 1 ){
                            colo = 'orange'

                            if ( timeDiffInHours < 0 ){

                                colo = 'red'
                                remain_per = 150

                            }}}

                    if ( createdOnCell.querySelectorAll('div').length == 0 )
                    {

                        // Create the inner div to represent 50% fill
                        let fillDiv = document.createElement('div');
                        fillDiv.style.backgroundColor = colo;
                        fillDiv.style.height = '8px';
                        fillDiv.style.width = remain_per + 'px';

                        // Append the fillDiv to the cell
                        createdOnCell.appendChild(fillDiv);
                    }

                    else
                    {
                        createOnBlock.style.backgroundColor = colo ;
                        createOnBlock.style.width = remain_per + 'px';
                    }
                }
            }

            // } else if (timeDiffInHours > 4 && timeDiffInHours <= 8) {
            //     createdOnCell.style.backgroundColor = 'yellow';
            //     createdOnCell.style.color = 'black';
            // } else {
            //     createdOnCell.style.backgroundColor = 'green';
            //     createdOnCell.style.color = 'black';
            // }
        });
    }

    const sla = {
        "Improve Availability" : [24, 168, 168],
        "Place Opportunity Buys" : [48, 72, 72],
        "Identify and Understand Supply Chain Defects" : [336, 336, 336],
        "Manage Incoming Stock" : [24, 72, 72],
        "Manage Logistic Programs" : [24, 72, 72],
        "Manage Profitability" : [24, 120, 120],
        "Seasonal Buying" : [72, 120, 120],
        "F3 Retail Owned Sourceability" : [120, 120, 120],
        "Availability and Instock Reactive - Not Localized check" : [72, 72, 72],
        "Availability and Instock Reactive - Add Accessories" : [24, 24, 24],
        "Availability and Instock Reactive - Bin Check and Destroy" : [72, 72, 72],
        "Availability and Instock Reactive - Overstock returns removal" : [24, 24, 24],
        "Availability and Instock Reactive - Add vendor outage" : [24, 24, 24],
        "Availability and Instock Reactive - Direct Fulfillment (DF) ASIN Flip" : [72, 72, 72],
        "Availability and Instock Reactive - ASIN replacement" : [72, 72, 72],
        "Analyse and Support Traffic Initiatives" : [48, 48, 48],
        "Improve Coupon Coverage" : [48, 48, 48],
        "Increase VPV Coverage" : [48, 48, 48],
        "Provide Proof and Analyse Campaigns" : [72, 120, 120],
        "Quarterly Business Review with Vendor" : [48, 48, 48],
        "Share Standard Vendor Reports" : [48, 48, 48],
        "Support vendor in AVS onboarding" : [120, 168, 168],
        "LBO [Lost Business Opportunity]" : [24, 24, 24],
        "Traffic Conversion Report" : [48, 48, 48],
        "Availability and Instock Reactive - Making attribute change in SC (Availability and lifecycle)" : [24, 120, 120],
        "Availability and Instock Reactive - Action on Exclusions" : [24, 120, 120],
        "Availability and Instock Reactive - Crap and De-Crap ASINs" : [24, 168, 168],
        "Availability and Instock Reactive - Boss/Unboss ASINs" : [24, 168, 168],
        "Availability and Instock Reactive - Work with partners to fix buyability issues (Troubleshoot)" : [24, 168, 168],
        "Availability and Instock Reactive - FIC Suppression Reinstatement" : [24, 168, 168],
        "Availability and Instock Reactive - Placing buys" : [48, 72, 72],
        "Availability and Instock Reactive - PO Edits" : [24, 24, 24],
        "Manage Range Change" : [24, 120,120]
    }


    const fastTrack = ['(FT) Instock - Boss/Unboss','(FT) Instock - Add & Remove EOL',	'(FT) Instock - Line item/Complete PO cancel',	'(FT) Instock - PO Cost Edit',	'(FT) Instock - DW Extension',	'(FT) Instock - PO Un-cancel',	'(FT) Instock - Crap/Decrap',	'(FT) Instock - boss/un-boss request',	'(FT) Instock - EOL request',	'(FT) Instock - Remove Exclusion']

    // Run the function every 10 seconds (10000 milliseconds)
    setInterval(highlightCreateOn, 30000);

    highlightCreateOn();
})();
