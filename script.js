// Calendar Date Range Picker Implementation
// Based on PRD requirements using Flatpickr

document.addEventListener('DOMContentLoaded', function() {
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    const rangeDisplay = document.getElementById('range-display');
    const clearButton = document.getElementById('clear-range');

    let flatpickrInstance;

    // Initialize Flatpickr with range mode
    function initializeDatePicker() {
        flatpickrInstance = flatpickr(startInput, {
            mode: "range",
            dateFormat: "Y-m-d",
            allowInput: false,
            clickOpens: true,
            closeOnSelect: false, // Keep open until range is complete
            showMonths: 1,
            
            // Keyboard navigation as per PRD requirements
            enableTime: false,
            
            // Styling and positioning
            position: "below",
            
            // Event handlers
            onChange: function(selectedDates, dateStr, instance) {
                handleDateChange(selectedDates, dateStr);
            },
            
            onReady: function(selectedDates, dateStr, instance) {
                // Sync both inputs to open the same calendar
                endInput.addEventListener('focus', function() {
                    instance.open();
                });
                
                endInput.addEventListener('click', function() {
                    instance.open();
                });
                
                // Hide year arrows when calendar is ready
                hideYearArrows();
            },
            
            onOpen: function(selectedDates, dateStr, instance) {
                // Add ARIA attributes for accessibility
                const calendar = instance.calendarContainer;
                calendar.setAttribute('role', 'grid');
                calendar.setAttribute('aria-label', 'Date range picker');
                
                // Hide year arrows after calendar opens
                setTimeout(hideYearArrows, 50);
            }
        });
    }

    // Handle date selection changes
    function handleDateChange(selectedDates, dateStr) {
        console.log('handleDateChange called:', {
            selectedDatesLength: selectedDates.length,
            dateStr,
            dates: selectedDates.map(d => formatDate(d)),
            isSettingPresetRange
        });
        
        // Skip updates if we're setting a preset range to prevent flashing
        if (isSettingPresetRange) {
            console.log('Skipping update - preset range in progress');
            return;
        }
        
        if (selectedDates.length === 0) {
            // No dates selected
            startInput.value = '';
            endInput.value = '';
            updateRangeDisplay();
            console.log('Cleared both inputs');
        } else if (selectedDates.length === 1) {
            // Only start date selected
            const startDate = selectedDates[0];
            startInput.value = formatDate(startDate);
            endInput.value = '';
            updateRangeDisplay(startDate);
            console.log('Set start date only:', formatDate(startDate));
        } else if (selectedDates.length === 2) {
            // Both dates selected - complete range
            const [startDate, endDate] = selectedDates;
            startInput.value = formatDate(startDate);
            endInput.value = formatDate(endDate);
            updateRangeDisplay(startDate, endDate);
            console.log('Set both dates - Start:', formatDate(startDate), 'End:', formatDate(endDate));
            
            // Close calendar after complete selection
            setTimeout(() => {
                flatpickrInstance.close();
            }, 200);
        }
    }

    // Format date for display
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Update the range display with accessibility announcement
    function updateRangeDisplay(startDate = null, endDate = null) {
        let displayText;
        
        if (!startDate) {
            displayText = 'No range selected';
        } else if (!endDate) {
            displayText = `Start: ${formatDisplayDate(startDate)} (select end date)`;
        } else {
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            displayText = `${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)} (${days} days)`;
        }
        
        rangeDisplay.textContent = displayText;
        
        // Announce to screen readers
        rangeDisplay.setAttribute('aria-live', 'polite');
    }

    // Format date for user-friendly display
    function formatDisplayDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Clear range functionality
    function clearRange() {
        if (flatpickrInstance) {
            flatpickrInstance.clear();
        }
        startInput.value = '';
        endInput.value = '';
        updateRangeDisplay();
    }

    // Flag to prevent flashing during preset range setting
    let isSettingPresetRange = false;

    // Helper function to get next Sunday
    function getNextSunday() {
        const today = new Date();
        const daysUntilSunday = (7 - today.getDay()) % 7;
        const nextSunday = new Date(today);
        
        // If today is Sunday, get next Sunday (7 days from now)
        if (daysUntilSunday === 0) {
            nextSunday.setDate(today.getDate() + 7);
        } else {
            nextSunday.setDate(today.getDate() + daysUntilSunday);
        }
        
        return nextSunday;
    }

    // Week range functions (starting from next Sunday)
    function setWeekRange(weeks) {
        const startDate = getNextSunday();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (weeks * 7) - 1); // -1 because we want inclusive range
        
        console.log('Setting week range:', {
            weeks,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        });
        
        if (flatpickrInstance) {
            // Set flag to prevent intermediate updates
            isSettingPresetRange = true;
            
            // Set the date range in Flatpickr (this will trigger onChange events)
            flatpickrInstance.setDate([startDate, endDate]);
            
            // Immediately set the final values to prevent flashing
            startInput.value = formatDate(startDate);
            endInput.value = formatDate(endDate);
            updateRangeDisplay(startDate, endDate);
            
            // Clear the flag after a short delay
            setTimeout(() => {
                isSettingPresetRange = false;
            }, 50);
            
            console.log('Set week range - Start:', startInput.value, 'End:', endInput.value);
        }
    }

    // Legacy preset range function (keeping for compatibility)
    function setPresetRange(days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);
        
        console.log('Setting preset range:', {
            days,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        });
        
        if (flatpickrInstance) {
            // Set flag to prevent intermediate updates
            isSettingPresetRange = true;
            
            // Set the date range in Flatpickr (this will trigger onChange events)
            flatpickrInstance.setDate([startDate, endDate]);
            
            // Immediately set the final values to prevent flashing
            startInput.value = formatDate(startDate);
            endInput.value = formatDate(endDate);
            updateRangeDisplay(startDate, endDate);
            
            // Clear the flag after a short delay
            setTimeout(() => {
                isSettingPresetRange = false;
            }, 50);
            
            console.log('Set preset range - Start:', startInput.value, 'End:', endInput.value);
        }
    }

    // Event listeners for demo buttons
    clearButton.addEventListener('click', clearRange);
    
    const preset4WeekButton = document.getElementById('preset-4week');
    const preset12WeekButton = document.getElementById('preset-12week');
    
    preset4WeekButton.addEventListener('click', function() {
        setWeekRange(4);
    });
    
    preset12WeekButton.addEventListener('click', function() {
        setWeekRange(12);
    });

    // Keyboard accessibility improvements
    document.addEventListener('keydown', function(e) {
        // Close calendar on Escape key (PRD requirement F-5)
        if (e.key === 'Escape' && flatpickrInstance && flatpickrInstance.isOpen) {
            flatpickrInstance.close();
        }
    });

    // Prevent manual input (PRD requirement F-1: read-only inputs)
    [startInput, endInput].forEach(input => {
        input.addEventListener('keydown', function(e) {
            // Allow tab, escape, and other navigation keys
            const allowedKeys = ['Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (!allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
        });
    });



    // Initialize the date picker
    initializeDatePicker();

    // Log analytics event (PRD requirement - analytics tracking)
    function logDateRangeSelected(startDate, endDate) {
        console.log('Analytics Event:', {
            event: 'dateRangeSelected',
            start: startDate,
            end: endDate,
            source: 'picker',
            timestamp: new Date().toISOString()
        });
    }

    // Enhanced change handler with analytics
    const originalHandleDateChange = handleDateChange;
    handleDateChange = function(selectedDates, dateStr) {
        originalHandleDateChange(selectedDates, dateStr);
        
        if (selectedDates.length === 2) {
            logDateRangeSelected(selectedDates[0], selectedDates[1]);
        }
    };

    // FINAL NUCLEAR APPROACH - CHANGE INPUT TYPE TO TEXT
    function hideYearArrows() {
        console.log('hideYearArrows called - NUCLEAR APPROACH');
        const calendar = document.querySelector('.flatpickr-calendar');
        if (!calendar) {
            console.log('No calendar found');
            return;
        }
        
        const yearInput = calendar.querySelector('.cur-year');
        if (!yearInput) {
            console.log('No year input found');
            return;
        }
        
        console.log('BEFORE - Input type:', yearInput.type, 'Value:', yearInput.value);
        
        // NUCLEAR: Change input type to text (removes ALL possibility of spinners)
        const currentValue = yearInput.value;
        yearInput.type = 'text';
        yearInput.value = currentValue;
        
        // Add validation to maintain number-only behavior
        yearInput.addEventListener('input', function(e) {
            // Only allow digits
            this.value = this.value.replace(/[^0-9]/g, '');
            // Limit to 4 digits
            if (this.value.length > 4) {
                this.value = this.value.slice(0, 4);
            }
        });
        
        yearInput.addEventListener('blur', function(e) {
            const year = parseInt(this.value);
            const currentYear = new Date().getFullYear();
            if (isNaN(year) || year < 1900 || year > currentYear + 100) {
                this.value = currentYear;
            }
        });
        
        console.log('AFTER - Input type:', yearInput.type, 'Value:', yearInput.value);
        console.log('✅ NUCLEAR SUCCESS: Changed input type to text - NO SPINNERS POSSIBLE!');
    }
}); 