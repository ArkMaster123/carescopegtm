import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BusinessForm } from '@/components/BusinessForm';

describe('BusinessForm', () => {
  it('renders the form correctly', () => {
    render(<BusinessForm onSubmit={async () => {}} isLoading={false} />);
    
    expect(screen.getByText('Describe Your Business')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/sustainable coffee brand/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find influencers/i })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<BusinessForm onSubmit={async () => {}} isLoading={true} />);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });
});
