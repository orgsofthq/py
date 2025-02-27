import requests
import cowsay

def main():
    # Make a GET request to a public API
    response = requests.get("https://api.github.com/zen")
    
    print("Hello from py!")
    print("\nGitHub's Zen for today:")
    # Use a cow to display the zen message
    cowsay.cow(response.text)

    return response.text


if __name__ == "__main__":
    main() 