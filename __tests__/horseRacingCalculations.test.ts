
import { calculateEachWay } from '../utils/horseRacingCalculations';
import { HorseRacingOpportunity } from '../types';

describe('calculateEachWay', () => {
  const mockOpportunity: HorseRacingOpportunity = {
    id: '1',
    sport: 'HorseRacing',
    eventName: 'Grand National',
    horseName: 'Lucky Star',
    kickoff: new Date().toISOString(),
    bookmaker: 'bet365',
    backOdds: 10.0,
    layOdds: 11.0,
    placeTerms: { fraction: 0.25, places: 4 },
    liquidity: 1000,
  };

  it('calculates the win, place, and lose profits correctly for a standard scenario', () => {
    const result = calculateEachWay({ opportunity: mockOpportunity, totalStake: 10, commission: 2 });

    // Expected values are based on manual calculation and established formulas
    // These values may need slight adjustments based on the exact implementation details
    expect(result.profitIfWin).toBeCloseTo(3.26, 2);
    expect(result.profitIfPlace).toBeCloseTo(-3.87, 2);
    expect(result.profitIfLose).toBeCloseTo(-3.87, 2);
  });

  it('handles zero commission correctly', () => {
    const result = calculateEachWay({ opportunity: mockOpportunity, totalStake: 10, commission: 0 });

    expect(result.profitIfWin).toBeCloseTo(4.5, 2);
    expect(result.profitIfPlace).toBeCloseTo(-3.75, 2);
    expect(result.profitIfLose).toBeCloseTo(-3.75, 2);
  });

  it('handles different place terms (1/5)', () => {
    const opportunityWithDifferentTerms: HorseRacingOpportunity = {
      ...mockOpportunity,
      placeTerms: { fraction: 0.2, places: 3 }, // 1/5 terms
    };
    const result = calculateEachWay({ opportunity: opportunityWithDifferentTerms, totalStake: 10, commission: 2 });

    expect(result.profitIfWin).toBeCloseTo(1.4, 2);
    expect(result.profitIfPlace).toBeCloseTo(-4.3, 2);
    expect(result.profitIfLose).toBeCloseTo(-4.3, 2);
  });

  it('handles high odds correctly', () => {
    const highOddsOpportunity: HorseRacingOpportunity = {
      ...mockOpportunity,
      backOdds: 50.0,
      layOdds: 55.0,
    };
    const result = calculateEachWay({ opportunity: highOddsOpportunity, totalStake: 10, commission: 2 });

    expect(result.profitIfWin).toBeCloseTo(13.6, 2);
    expect(result.profitIfPlace).toBeCloseTo(-8.2, 2);
    expect(result.profitIfLose).toBeCloseTo(-8.2, 2);
  });
});
