export function formatTenure(startDate: string, endDate: string | null) {
	return `${formatMonthYear(startDate)} — ${endDate ? formatMonthYear(endDate) : 'Present'}`;
}

export function formatMonthYear(value: string) {
	const [year, month] = value.split('-').map(Number);
	return new Date(year, (month ?? 1) - 1).toLocaleDateString('en-GB', {
		month: 'short',
		year: 'numeric',
	});
}
