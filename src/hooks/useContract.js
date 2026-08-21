import { useCallback, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import contractConfig from '../utils/contractConfig';

export const useContract = () => {
  const { library, account } = useWeb3React();

  const contract = useMemo(() => {
    if (!library || !account) return null;
    try {
      const signer = library.getSigner(account);
      return new ethers.Contract(
        contractConfig.VotingSystem.address,
        contractConfig.VotingSystem.abi,
        signer
      );
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  }, [library, account]);

  // Function for admin to create an election
  const createElection = useCallback(
    async (title, description, startTime, endTime, logoUrl) => {
      if (!contract) throw new Error('Chưa kết nối với contract');
      try {
        const tx = await contract.createElection(
          title,
          description,
          startTime,
          endTime,
          logoUrl
        );
        await tx.wait();
        return tx;
      } catch (error) {
        console.error('Error creating election:', error);
        throw error;
      }
    },
    [contract]
  );

  // Function for admin to add a candidate
  const addCandidate = useCallback(
    async (electionId, name, description, birthDate, hometown, position, achievements, motto, imageUrl) => {
      if (!contract) throw new Error('Chưa kết nối với contract');
      try {
        const tx = await contract.addCandidate(
          electionId,
          name,
          description,
          birthDate,
          hometown,
          position,
          achievements,
          motto,
          imageUrl
        );
        await tx.wait();
        return tx;
      } catch (error) {
        console.error('Error adding candidate:', error);
        throw error;
      }
    },
    [contract]
  );

  // Function for voter registration
  const registerVoter = useCallback(
    async (name, cccd, voterAddress, birthDate) => {
      if (!contract) throw new Error('Chưa kết nối với contract');
      try {
        const tx = await contract.registerVoter(name, cccd, voterAddress, birthDate);
        await tx.wait();
        return tx;
      } catch (error) {
        console.error('Error registering voter:', error);
        throw error;
      }
    },
    [contract]
  );

  // Function to vote
  const vote = useCallback(
    async (electionId, candidateId) => {
      if (!contract) throw new Error('Chưa kết nối với contract');
      try {
        const tx = await contract.vote(electionId, candidateId);
        await tx.wait();
        return tx;
      } catch (error) {
        console.error('Error voting:', error);
        throw error;
      }
    },
    [contract]
  );

  // Function to get elections
  const getElections = useCallback(async () => {
    if (!contract) throw new Error('Chưa kết nối với contract');
    try {
      const count = await contract.getElectionCount();
      const elections = [];
      for (let i = 0; i < count; i++) {
        const election = await contract.getElection(i);
        elections.push({
          id: i,
          title: election.title,
          description: election.description,
          startTime: new Date(election.startTime.toNumber() * 1000),
          endTime: new Date(election.endTime.toNumber() * 1000),
          logoUrl: election.logoUrl,
          isCompleted: election.isCompleted,
          candidateCount: election.candidateCount.toNumber(),
        });
      }
      return elections;
    } catch (error) {
      console.error('Error getting elections:', error);
      throw error;
    }
  }, [contract]);

  // Function to get candidates of an election
  const getCandidates = useCallback(
    async (electionId) => {
      if (!contract) throw new Error('Chưa kết nối với contract');
      try {
        const count = await contract.getCandidateCount(electionId);
        const candidates = [];
        for (let i = 0; i < count; i++) {
          const candidate = await contract.getCandidate(electionId, i);
          candidates.push({
            id: i,
            name: candidate.name,
            description: candidate.description,
            birthDate: candidate.birthDate,
            hometown: candidate.hometown,
            position: candidate.position,
            achievements: candidate.achievements,
            motto: candidate.motto,
            imageUrl: candidate.imageUrl,
            voteCount: candidate.voteCount.toNumber(),
            isElected: candidate.isElected,
          });
        }
        return candidates;
      } catch (error) {
        console.error('Error getting candidates:', error);
        throw error;
      }
    },
    [contract]
  );

  // Function for admin
  const addAdmin = useCallback(
    async (adminAddress, name) => {
      if (!contract) throw new Error('Chưa kết nối với contract');
      try {
        const tx = await contract.addAdmin(adminAddress, name);
        await tx.wait();
        return tx;
      } catch (error) {
        console.error('Error adding admin:', error);
        throw error;
      }
    },
    [contract]
  );

  // Function to complete an election
  const completeElection = useCallback(
    async (electionId) => {
      if (!contract) throw new Error('Chưa kết nối với contract');
      try {
        const tx = await contract.completeElection(electionId);
        await tx.wait();
        return tx;
      } catch (error) {
        console.error('Error completing election:', error);
        throw error;
      }
    },
    [contract]
  );

  // Function to get election result
  const getElectionResult = useCallback(
    async (electionId) => {
      if (!contract) throw new Error('Chưa kết nối với contract');
      try {
        const result = await contract.getElectionResult(electionId);
        return {
          totalVotes: result.totalVotes.toNumber(),
          totalVoters: result.totalVoters.toNumber(),
          winningCandidateId: result.winningCandidateId.toNumber(),
          winningVoteCount: result.winningVoteCount.toNumber(),
        };
      } catch (error) {
        console.error('Error getting election result:', error);
        throw error;
      }
    },
    [contract]
  );

  // Function to get candidate votes
  const getCandidateVotes = useCallback(
    async (electionId) => {
      if (!contract) throw new Error('Chưa kết nối với contract');
      try {
        const result = await contract.getCandidateVotes(electionId);
        const candidateIds = result.candidateIds.map(id => id.toNumber());
        const voteCounts = result.voteCounts.map(count => count.toNumber());
        
        // Kết hợp thành một mảng đối tượng
        const votesData = candidateIds.map((id, index) => ({
          candidateId: id,
          voteCount: voteCounts[index]
        }));
        
        return votesData;
      } catch (error) {
        console.error('Error getting candidate votes:', error);
        throw error;
      }
    },
    [contract]
  );

  return {
    contract,
    createElection,
    addCandidate,
    registerVoter,
    vote,
    getElections,
    getCandidates,
    addAdmin,
    completeElection,
    getElectionResult,
    getCandidateVotes,
  };
}; 