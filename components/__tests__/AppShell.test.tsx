import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: () => '/drugs',
}));

import { AppShell } from '../AppShell';

describe('AppShell', () => {
    it('renders Drugs navigation label', () => {
        render(
            <AppShell>
                <div>Test content</div>
            </AppShell>
        );

        expect(screen.getByText('Drugs')).toBeInTheDocument();
    });
});
