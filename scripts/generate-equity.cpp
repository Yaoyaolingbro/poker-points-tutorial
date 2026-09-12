#include <algorithm>
#include <array>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

constexpr int CATEGORY_BASE = 759375;
const std::array<std::string, 13> LABELS = {"A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"};
const std::array<int, 13> VALUES = {14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2};

uint32_t next_random(uint32_t& state) {
  state ^= state << 13;
  state ^= state >> 17;
  state ^= state << 5;
  return state;
}

int straight_high(uint16_t mask) {
  for (int high = 14; high >= 6; --high) {
    bool found = true;
    for (int offset = 0; offset < 5; ++offset) found = found && (mask & (1u << (high - offset)));
    if (found) return high;
  }
  const uint16_t wheel = (1u << 14) | (1u << 5) | (1u << 4) | (1u << 3) | (1u << 2);
  return (mask & wheel) == wheel ? 5 : 0;
}

int pack(int category, std::initializer_list<int> ranks) {
  int detail = 0;
  int used = 0;
  for (int rank : ranks) {
    detail = detail * 15 + rank;
    ++used;
  }
  while (used++ < 5) detail *= 15;
  return category * CATEGORY_BASE + detail;
}

int score7(const std::array<int, 7>& cards) {
  int counts[15] = {};
  int suit_counts[4] = {};
  uint16_t rank_mask = 0;
  uint16_t suit_masks[4] = {};
  for (int card : cards) {
    const int rank = card / 4 + 2;
    const int suit = card % 4;
    ++counts[rank];
    ++suit_counts[suit];
    rank_mask |= 1u << rank;
    suit_masks[suit] |= 1u << rank;
  }

  for (int suit = 0; suit < 4; ++suit) {
    if (suit_counts[suit] >= 5) {
      const int high = straight_high(suit_masks[suit]);
      if (high) return pack(8, {high});
    }
  }

  for (int rank = 14; rank >= 2; --rank) {
    if (counts[rank] == 4) {
      int kicker = 0;
      for (int other = 14; other >= 2; --other) if (other != rank && counts[other]) { kicker = other; break; }
      return pack(7, {rank, kicker});
    }
  }

  int top_trip = 0;
  int second_pair = 0;
  for (int rank = 14; rank >= 2; --rank) {
    if (counts[rank] >= 3) { top_trip = rank; break; }
  }
  for (int rank = 14; rank >= 2; --rank) {
    if (rank != top_trip && counts[rank] >= 2) { second_pair = rank; break; }
  }
  if (top_trip && second_pair) return pack(6, {top_trip, second_pair});

  for (int suit = 0; suit < 4; ++suit) {
    if (suit_counts[suit] >= 5) {
      std::array<int, 5> ranks{};
      int index = 0;
      for (int rank = 14; rank >= 2 && index < 5; --rank) if (suit_masks[suit] & (1u << rank)) ranks[index++] = rank;
      return pack(5, {ranks[0], ranks[1], ranks[2], ranks[3], ranks[4]});
    }
  }

  const int straight = straight_high(rank_mask);
  if (straight) return pack(4, {straight});

  if (top_trip) {
    std::array<int, 2> kickers{};
    int index = 0;
    for (int rank = 14; rank >= 2 && index < 2; --rank) if (rank != top_trip && counts[rank]) kickers[index++] = rank;
    return pack(3, {top_trip, kickers[0], kickers[1]});
  }

  std::array<int, 3> pairs{};
  int pair_count = 0;
  for (int rank = 14; rank >= 2 && pair_count < 3; --rank) if (counts[rank] >= 2) pairs[pair_count++] = rank;
  if (pair_count >= 2) {
    int kicker = 0;
    for (int rank = 14; rank >= 2; --rank) if (rank != pairs[0] && rank != pairs[1] && counts[rank]) { kicker = rank; break; }
    return pack(2, {pairs[0], pairs[1], kicker});
  }

  if (pair_count == 1) {
    std::array<int, 3> kickers{};
    int index = 0;
    for (int rank = 14; rank >= 2 && index < 3; --rank) if (rank != pairs[0] && counts[rank]) kickers[index++] = rank;
    return pack(1, {pairs[0], kickers[0], kickers[1], kickers[2]});
  }

  std::array<int, 5> highs{};
  int index = 0;
  for (int rank = 14; rank >= 2 && index < 5; --rank) if (counts[rank]) highs[index++] = rank;
  return pack(0, {highs[0], highs[1], highs[2], highs[3], highs[4]});
}

int card_id(int rank, int suit) { return (rank - 2) * 4 + suit; }

int main(int argc, char** argv) {
  if (argc != 4) return 2;
  const std::string output_path = argv[1];
  const int trials = std::stoi(argv[2]);
  const uint32_t seed = static_cast<uint32_t>(std::stoul(argv[3]));
  std::ofstream output(output_path);
  output << "{\n";
  bool first_hand = true;

  for (int row = 0; row < 13; ++row) {
    for (int column = 0; column < 13; ++column) {
      const bool pair = row == column;
      const bool suited = row < column;
      const int high_index = pair || suited ? row : column;
      const int low_index = pair || suited ? column : row;
      const std::string id = pair ? LABELS[high_index] + LABELS[low_index]
        : LABELS[high_index] + LABELS[low_index] + (suited ? "s" : "o");
      const int first_card = card_id(VALUES[high_index], 0);
      const int second_card = pair ? card_id(VALUES[low_index], 1)
        : suited ? card_id(VALUES[low_index], 0) : card_id(VALUES[low_index], 1);

      std::array<int, 50> base_deck{};
      int deck_index = 0;
      for (int card = 0; card < 52; ++card) if (card != first_card && card != second_card) base_deck[deck_index++] = card;
      std::array<uint64_t, 7> wins{};
      std::array<uint64_t, 7> ties{};
      std::array<double, 7> equities{};
      uint32_t state = seed ^ static_cast<uint32_t>((row * 13 + column + 1) * 0x9e3779b9u);

      for (int trial = 0; trial < trials; ++trial) {
        auto deck = base_deck;
        for (int index = 0; index < 19; ++index) {
          const int swap_index = index + static_cast<int>(next_random(state) % (50 - index));
          std::swap(deck[index], deck[swap_index]);
        }
        const std::array<int, 5> board = {deck[14], deck[15], deck[16], deck[17], deck[18]};
        const int hero_score = score7({first_card, second_card, board[0], board[1], board[2], board[3], board[4]});
        int best_opponent = -1;
        int best_count = 0;
        for (int opponent = 0; opponent < 7; ++opponent) {
          const int score = score7({deck[opponent * 2], deck[opponent * 2 + 1], board[0], board[1], board[2], board[3], board[4]});
          if (score > best_opponent) { best_opponent = score; best_count = 1; }
          else if (score == best_opponent) ++best_count;
          if (hero_score > best_opponent) { ++wins[opponent]; equities[opponent] += 1.0; }
          else if (hero_score == best_opponent) { ++ties[opponent]; equities[opponent] += 1.0 / static_cast<double>(best_count + 1); }
        }
      }

      if (!first_hand) output << ",\n";
      first_hand = false;
      output << "  \"" << id << "\": {";
      for (int opponent = 0; opponent < 7; ++opponent) {
        if (opponent) output << ",";
        output << "\n    \"" << opponent + 1 << "\": {\"opponents\":" << opponent + 1
          << ",\"trials\":" << trials
          << ",\"win\":" << std::fixed << std::setprecision(6) << static_cast<double>(wins[opponent]) / trials
          << ",\"tie\":" << static_cast<double>(ties[opponent]) / trials
          << ",\"equity\":" << equities[opponent] / trials << "}";
      }
      output << "\n  }";
      std::cerr << "equity " << id << " " << row * 13 + column + 1 << "/169\n";
    }
  }
  output << "\n}\n";
  return 0;
}
