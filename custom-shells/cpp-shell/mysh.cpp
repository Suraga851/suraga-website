#include <algorithm>
#include <cstdlib>
#include <cstring>
#include <filesystem>
#include <iostream>
#include <optional>
#include <string>
#include <vector>

#ifdef _WIN32
#include <Windows.h>
#include <direct.h>
#else
#include <unistd.h>
extern char **environ;
#endif

enum class TokenKind { Word, Pipe };

struct Token {
    TokenKind kind;
    std::string text;
};

static void print_prompt() {
    std::string name = "?";
    try {
        auto cwd = std::filesystem::current_path();
        name = cwd.filename().string();
        if (name.empty()) {
            name = cwd.string();
        }
    } catch (...) {
    }

    std::cout << "mysh-cpp:" << name << "> " << std::flush;
}

static void push_word(std::vector<Token> &tokens, std::string &word) {
    if (!word.empty()) {
        tokens.push_back({TokenKind::Word, word});
        word.clear();
    }
}

static std::optional<std::vector<Token>> tokenize(const std::string &line) {
    std::vector<Token> tokens;
    std::string word;
    char quote = '\0';

    for (std::size_t i = 0; i < line.size(); ++i) {
        char ch = line[i];

        if (quote == '\'') {
            if (ch == '\'') {
                quote = '\0';
            } else {
                word.push_back(ch);
            }
            continue;
        }

        if (quote == '"') {
            if (ch == '"') {
                quote = '\0';
            } else if (ch == '\\' && i + 1 < line.size()) {
                word.push_back(line[++i]);
            } else {
                word.push_back(ch);
            }
            continue;
        }

        if (ch == '\'' || ch == '"') {
            quote = ch;
        } else if (ch == '#' && word.empty()) {
            break;
        } else if (ch == '|') {
            push_word(tokens, word);
            tokens.push_back({TokenKind::Pipe, "|"});
        } else if (std::isspace(static_cast<unsigned char>(ch))) {
            push_word(tokens, word);
        } else if (ch == '\\' && i + 1 < line.size()) {
            char next = line[i + 1];
            if (std::isspace(static_cast<unsigned char>(next)) || next == '\'' || next == '"' || next == '|' || next == '\\') {
                word.push_back(next);
                ++i;
            } else {
                word.push_back(ch);
            }
        } else {
            word.push_back(ch);
        }
    }

    if (quote != '\0') {
        std::cerr << "parse error: missing closing " << quote << " quote\n";
        return std::nullopt;
    }

    push_word(tokens, word);
    return tokens;
}

static std::vector<std::string> words_only(const std::vector<Token> &tokens) {
    std::vector<std::string> words;
    for (const auto &token : tokens) {
        if (token.kind == TokenKind::Word) {
            words.push_back(token.text);
        }
    }
    return words;
}

static std::filesystem::path home_dir() {
#ifdef _WIN32
    char *home = nullptr;
    std::size_t length = 0;
    if (_dupenv_s(&home, &length, "USERPROFILE") != 0 || home == nullptr) {
        return {};
    }
    std::filesystem::path result(home);
    std::free(home);
    return result;
#else
    const char *home = std::getenv("HOME");
    if (home == nullptr) {
        return {};
    }
    return home;
#endif
}

static void print_help() {
    std::cout << "Builtins:\n"
              << "  help             show this message\n"
              << "  pwd              print current directory\n"
              << "  cd [DIR]         change directory, or home if DIR is omitted\n"
              << "  ls [DIR]         list a directory\n"
              << "  set NAME VALUE   set an environment variable for this shell\n"
              << "  unset NAME       remove an environment variable for this shell\n"
              << "  env              print environment variables\n"
              << "  exit             leave the shell\n\n"
              << "External commands are passed to the host shell with std::system.\n";
}

static void list_dir(const std::string &target) {
    try {
        std::vector<std::filesystem::path> entries;
        for (const auto &entry : std::filesystem::directory_iterator(target)) {
            entries.push_back(entry.path());
        }

        std::sort(entries.begin(), entries.end());
        for (const auto &path : entries) {
            std::cout << path.filename().string();
            if (std::filesystem::is_directory(path)) {
                std::cout << "/";
            }
            std::cout << "\n";
        }
    } catch (const std::exception &error) {
        std::cerr << "ls: " << error.what() << "\n";
    }
}

static void set_env(const std::string &name, const std::string &value) {
#ifdef _WIN32
    _putenv_s(name.c_str(), value.c_str());
#else
    setenv(name.c_str(), value.c_str(), 1);
#endif
}

static void unset_env(const std::string &name) {
#ifdef _WIN32
    _putenv_s(name.c_str(), "");
#else
    unsetenv(name.c_str());
#endif
}

static void print_env() {
#ifdef _WIN32
    LPCH env_block = GetEnvironmentStringsA();
    if (env_block == nullptr) {
        std::cerr << "env: unable to read environment\n";
        return;
    }

    for (LPCH current = env_block; *current != '\0'; current += std::strlen(current) + 1) {
        if (*current != '=') {
            std::cout << current << "\n";
        }
    }
    FreeEnvironmentStringsA(env_block);
#else
    for (char **current = environ; *current != nullptr; ++current) {
        std::cout << *current << "\n";
    }
#endif
}

enum class BuiltinResult { Handled, Exit, NotBuiltin };

static BuiltinResult run_builtin(const std::vector<std::string> &args) {
    if (args.empty()) {
        return BuiltinResult::Handled;
    }

    const std::string &command = args[0];

    if (command == "exit" || command == "quit") {
        return BuiltinResult::Exit;
    }

    if (command == "help") {
        print_help();
        return BuiltinResult::Handled;
    }

    if (command == "pwd") {
        try {
            std::cout << std::filesystem::current_path().string() << "\n";
        } catch (const std::exception &error) {
            std::cerr << "pwd: " << error.what() << "\n";
        }
        return BuiltinResult::Handled;
    }

    if (command == "cd") {
        auto target = args.size() >= 2 ? std::filesystem::path(args[1]) : home_dir();
        if (target.empty()) {
            std::cerr << "cd: home directory not found\n";
            return BuiltinResult::Handled;
        }
        try {
            std::filesystem::current_path(target);
        } catch (const std::exception &error) {
            std::cerr << "cd: " << error.what() << "\n";
        }
        return BuiltinResult::Handled;
    }

    if (command == "ls") {
        list_dir(args.size() >= 2 ? args[1] : ".");
        return BuiltinResult::Handled;
    }

    if (command == "set") {
        if (args.size() < 3) {
            std::cerr << "usage: set NAME VALUE\n";
        } else {
            std::string value = args[2];
            for (std::size_t i = 3; i < args.size(); ++i) {
                value += " " + args[i];
            }
            set_env(args[1], value);
        }
        return BuiltinResult::Handled;
    }

    if (command == "unset") {
        if (args.size() != 2) {
            std::cerr << "usage: unset NAME\n";
        } else {
            unset_env(args[1]);
        }
        return BuiltinResult::Handled;
    }

    if (command == "env") {
        print_env();
        return BuiltinResult::Handled;
    }

    return BuiltinResult::NotBuiltin;
}

int main() {
    std::cout << "mysh-cpp 0.1.0\n";
    std::cout << "Type 'help' for commands. Type 'exit' to leave.\n";

    std::string line;
    while (true) {
        print_prompt();
        if (!std::getline(std::cin, line)) {
            std::cout << "\n";
            break;
        }

        auto tokens = tokenize(line);
        if (!tokens || tokens->empty()) {
            continue;
        }

        auto args = words_only(*tokens);
        switch (run_builtin(args)) {
            case BuiltinResult::Handled:
                continue;
            case BuiltinResult::Exit:
                return 0;
            case BuiltinResult::NotBuiltin:
                break;
        }

        int code = std::system(line.c_str());
        if (code != 0) {
            std::cerr << "process exited with code " << code << "\n";
        }
    }

    return 0;
}
