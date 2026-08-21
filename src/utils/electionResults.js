export const calculateElectionResults = (electionId) => {
  try {
    // Get all necessary data from localStorage
    const storedElections = JSON.parse(localStorage.getItem('elections') || '[]');
    const storedCandidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    const storedVoters = JSON.parse(localStorage.getItem('voters') || '[]');

    // Find the election
    const election = storedElections.find(e => e && e.id && electionId && e.id.toString() === electionId.toString());
    if (!election) {
      throw new Error('Election not found');
    }

    // Get candidates for this election
    const candidates = storedCandidates.filter(
      c => c && c.electionId && electionId && c.electionId.toString() === electionId.toString()
    );

    // Calculate votes and participation
    const votedVoters = new Set();
    const voteCount = {};

    // Initialize vote count for each candidate
    candidates.forEach(candidate => {
      voteCount[candidate.id] = 0;
    });

    // Count votes from real voters
    storedVoters.forEach(voter => {
      const voteKey = `vote_${electionId}_${voter.cccd}`;
      const voteData = localStorage.getItem(voteKey);
      if (voteData) {
        const vote = JSON.parse(voteData);
        if (vote && vote.candidateIds && vote.candidateIds.length > 0) {
          votedVoters.add(voter.cccd);
          // Count votes for each candidate the voter voted for
          vote.candidateIds.forEach(candidateId => {
            if (voteCount.hasOwnProperty(candidateId)) {
              voteCount[candidateId]++;
            }
          });
        }
      }
    });

    const totalVotedVoters = votedVoters.size;
    const totalVoters = storedVoters.length;
    
    // Làm tròn tỷ lệ tham gia đến 1 chữ số thập phân
    const participationRate = totalVoters > 0 
      ? Math.round((totalVotedVoters / totalVoters) * 1000) / 10 
      : 0;

    const totalVotes = Object.values(voteCount).reduce((sum, count) => sum + count, 0);

    // Tính tỷ lệ phiếu bầu dựa trên số người đã tham gia bầu cử và làm tròn đến 1 chữ số thập phân
    const votesByCandidate = candidates.map(candidate => {
      const votes = voteCount[candidate.id] || 0;
      const percentage = totalVotedVoters > 0 
        ? Math.round((votes / totalVotedVoters) * 1000) / 10 
        : 0;
      return {
        candidate,
        votes,
        percentage
      };
    }).sort((a, b) => b.votes - a.votes);

    let winner = null;
    if (votesByCandidate.length > 0 && votesByCandidate[0].votes > 0) {
      winner = votesByCandidate[0].candidate;
    }

    return {
      election,
      candidates,
      votesByCandidate,
      totalVotes,
      participationRate,
      winner,
      totalVotedVoters,
      totalVoters
    };
  } catch (error) {
    console.error('Error calculating election results:', error);
    throw error;
  }
}; 