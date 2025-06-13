// Calendar Date Range Picker Implementation
// Based on PRD requirements using Flatpickr

document.addEventListener('DOMContentLoaded', function() {
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    const rangeDisplay = document.getElementById('range-display');
    const clearButton = document.getElementById('clear-range');
    const presetWeekButton = document.getElementById('preset-week');
    const presetMonthButton = document.getElementById('preset-month');

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
            },
            
            onOpen: function(selectedDates, dateStr, instance) {
                // Add ARIA attributes for accessibility
                const calendar = instance.calendarContainer;
                calendar.setAttribute('role', 'grid');
                calendar.setAttribute('aria-label', 'Date range picker');
            }
        });
    }

    // Handle date selection changes
    function handleDateChange(selectedDates, dateStr) {
        if (selectedDates.length === 0) {
            // No dates selected
            startInput.value = '';
            endInput.value = '';
            updateRangeDisplay();
        } else if (selectedDates.length === 1) {
            // Only start date selected
            const startDate = selectedDates[0];
            startInput.value = formatDate(startDate);
            endInput.value = '';
            updateRangeDisplay(startDate);
        } else if (selectedDates.length === 2) {
            // Both dates selected - complete range
            const [startDate, endDate] = selectedDates;
            startInput.value = formatDate(startDate);
            endInput.value = formatDate(endDate);
            updateRangeDisplay(startDate, endDate);
            
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

    // Preset range functions
    function setPresetRange(days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);
        
        if (flatpickrInstance) {
            flatpickrInstance.setDate([startDate, endDate]);
        }
    }

    // Event listeners for demo buttons
    clearButton.addEventListener('click', clearRange);
    
    presetWeekButton.addEventListener('click', function() {
        setPresetRange(7);
    });
    
    presetMonthButton.addEventListener('click', function() {
        setPresetRange(30);
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
}); 