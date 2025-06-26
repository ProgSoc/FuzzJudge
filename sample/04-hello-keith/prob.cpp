#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

int main(int argc, char **argv) {
  if (argc != 3) {
    std::cerr << "Usage: " << argv[0] << " <fuzz | judge> <seed>" << std::endl;
    return 1;
  }

  std::hash<std::string> hasher;
  size_t hash = hasher(argv[2]);
  srand(hash);

  std::vector<std::string> names = {
      "Bjarne", "Keith", "Alice", "Bob", "Charlie",
  };
  std::vector<std::string> chosen = {};
  while (!names.empty()) {
    size_t index = rand() % names.size();
    chosen.push_back(names[index]);
    names.erase(names.begin() + index);
  }

  std::string method = argv[1];
  if (method == "fuzz") {
    for (const auto &name : chosen) {
      std::cout << name << std::endl;
    }
  } else if (method == "judge") {
    std::string input;
    std::getline(std::cin, input);
    std::istringstream ss(input.c_str());
    size_t i = 0;
    for (std::string line; std::getline(ss, line); i++) {
      if (i >= chosen.size()) {
        std::cerr << "Too many lines." << std::endl;
        return 1;
      }

      std::string expected = "Hello, " + chosen[i] + "!";
      if (line != expected) {
        std::cerr << "Case: " << i + 1 << " expected: \"" << expected
                  << "\", got: \"" << line << "\"" << std::endl;
        return 1;
      }
    }

    if (i < chosen.size()) {
      std::cerr << "Too few lines. Expected " << chosen.size() << ", got "
                << i << std::endl;
      return 1;
    }
  } else {
    std::cerr << "Unknown method: " << method << std::endl;
    return 1;
  }

  return 0;
}
