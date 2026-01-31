import { addMonths, endOfMonth, endOfWeek, startOfMonth, subDays } from "date-fns";
import { startOfWeek } from "date-fns";
import { addDays } from "date-fns";

export const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

export const defaultTableHeight = 700;

export const quarters = [
    { start: 0, end: 2 },
    { start: 3, end: 5 },
    { start: 6, end: 8 },
    { start: 9, end: 11 },
];

export const predefinedRanges = [
    {
        label: 'Today',
        value: [new Date(), new Date()],
        placement: 'left',
    },
    {
        label: 'Yesterday',
        value: [addDays(new Date(), -1), addDays(new Date(), -1)],
        placement: 'left',
    },
    {
        label: 'This week',
        value: [startOfWeek(new Date()), endOfWeek(new Date())],
        placement: 'left',
    },
    {
        label: 'This month',
        value: [startOfMonth(new Date()), new Date()],
        placement: 'left',
    },
    {
        label: 'Last month',
        value: [startOfMonth(addMonths(new Date(), -1)), endOfMonth(addMonths(new Date(), -1))],
        placement: 'left',
    },
    {
        label: 'This quarter',
        value: [
            startOfMonth(
                new Date(
                    new Date().getFullYear(),
                    quarters[Math.floor(new Date().getMonth() / 3)].start
                )
            ),
            new Date(),
        ],
        placement: 'left',
    },
    {
        label: 'Q1',
        value: [
            new Date(new Date().getFullYear(), 0, 1),
            endOfMonth(new Date(new Date().getFullYear(), 2, 1)),
        ],
        placement: 'left',
    },
    {
        label: 'Q2',
        value: [
            new Date(new Date().getFullYear(), 3, 1),
            endOfMonth(new Date(new Date().getFullYear(), 5, 1)),
        ],
        placement: 'left',
    },
    {
        label: 'Q3',
        value: [
            new Date(new Date().getFullYear(), 6, 1),
            endOfMonth(new Date(new Date().getFullYear(), 8, 1)),
        ],
        placement: 'left',
    },
    {
        label: 'Q4',
        value: [
            new Date(new Date().getFullYear(), 9, 1),
            endOfMonth(new Date(new Date().getFullYear(), 11, 1)),
        ],
        placement: 'left',
    },
    {
        label: 'This year',
        value: [new Date(new Date().getFullYear(), 0, 1), new Date()],
        placement: 'left',
    },
    {
        label: 'Last year',
        value: [
            new Date(new Date().getFullYear() - 1, 0, 1),
            new Date(new Date().getFullYear(), 0, 0),
        ],
        placement: 'left',
    },
    // {
    //     label: 'All time',
    //     value: [new Date(new Date().getFullYear() - 1, 0, 1), new Date()],
    //     placement: 'left',
    // },
    {
        label: 'Last week',
        closeOverlay: false,
        value: (value) => {
            const [start = new Date()] = value || [];
            return [
                addDays(startOfWeek(start, { weekStartsOn: 0 }), -7),
                addDays(endOfWeek(start, { weekStartsOn: 0 }), -7),
            ];
        },
        appearance: 'default',
    },
];