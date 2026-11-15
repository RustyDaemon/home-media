export const formatUnixTimestamp = (unixTimestamp: number): string => {
	const date = new Date(unixTimestamp * 1000);

	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	const day = date.getDate();
	const month = months[date.getMonth()];
	const year = date.getFullYear();

	return `${day} ${month} ${year}`;
};

export const formatDateForDisplay = (dateInput: string | number): string => {
	if (typeof dateInput === 'number') {
		return formatUnixTimestamp(dateInput);
	}

	const date = new Date(dateInput);
	return formatUnixTimestamp(Math.floor(date.getTime() / 1000));
};
