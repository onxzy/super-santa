package main

import (
	"bufio"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"flag"
	"fmt"
	"os"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/fatih/color"
	"github.com/schollz/progressbar/v3"
	"golang.org/x/crypto/pbkdf2"
	"golang.org/x/text/unicode/norm"
)

// WrappedKey represents an AES-GCM wrapped key with its IV
type WrappedKey struct {
	IV         []byte
	WrappedKey []byte
}

// Result represents the result of a decryption attempt
type Result struct {
	Password  string
	Unwrapped []byte
	Success   bool
	Error     error
}

// Colors
var (
	titleColor     = color.New(color.FgHiCyan, color.Bold)
	infoColor      = color.New(color.FgHiBlue)
	successColor   = color.New(color.FgHiGreen, color.Bold)
	errorColor     = color.New(color.FgHiRed)
	highlightColor = color.New(color.FgHiYellow, color.Bold)
	dimColor       = color.New(color.FgHiWhite)
)

func parseBase64WrappedKey(input string) (*WrappedKey, error) {
	parts := strings.Split(input, ".")
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid wrapped key format: expected format 'iv.wrappedKey'")
	}

	iv, err := base64.StdEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, fmt.Errorf("failed to decode IV: %v", err)
	}

	wrappedKey, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("failed to decode wrapped key: %v", err)
	}

	return &WrappedKey{
		IV:         iv,
		WrappedKey: wrappedKey,
	}, nil
}

// normalizePassword normalizes the password using NFKC normalization form
// This matches the browser's password.normalize("NFKC") functionality
func normalizePassword(password string) string {
	return norm.NFKC.String(password)
}

// deriveAESKey derives an AES key from a password and salt using PBKDF2
// This matches the browser implementation in deriveKeyWithPBKDF2
func deriveAESKey(password string, salt []byte) ([]byte, error) {
	// Normalize the password using NFKC as done in the browser
	normalizedPassword := normalizePassword(password)

	// Use SHA-256 and 310000 iterations (as specified in the TS code)
	// Generate a 256-bit key (32 bytes) to match the browser implementation
	key := pbkdf2.Key([]byte(normalizedPassword), salt, 310000, 32, sha256.New)
	return key, nil
}

func unwrapKey(wrappedKey *WrappedKey, password string, salt []byte) ([]byte, error) {
	// Derive the AES key from the password
	key, err := deriveAESKey(password, salt)
	if err != nil {
		return nil, fmt.Errorf("failed to derive key: %v", err)
	}

	// Create AES-GCM cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %v", err)
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %v", err)
	}

	// Unwrap the key
	plaintext, err := aesGCM.Open(nil, wrappedKey.IV, wrappedKey.WrappedKey, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt: %v", err)
	}

	return plaintext, nil
}

func readWrappedKeyFromFile(filePath string) (string, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("error reading wrapped key file: %v", err)
	}

	// Trim any whitespace or newlines
	return strings.TrimSpace(string(data)), nil
}

// printBanner prints a cool ASCII art banner
func printBanner() {
	banner := `
		 ▄▄▄██▀▀▀█     █░██ ▄█▀
		   ▒██  ▓█░ █ ░█░██▄█▒ 
		   ░██  ▒█░ █ ░█▓███▄░ 
		▓██▄██▓ ░█░ █ ░█▓██ █▄ 
		 ▓███▒  ░░██▒██▓▒██▒ █▄
		 ▒▓▒▒░  ░ ▓░▒ ▒ ▒ ▒▒ ▓▒
		 ▒ ░▒░    ▒ ░ ░ ░ ░▒ ▒░
		 ░ ░ ░    ░   ░ ░ ░░ ░ 
		 ░   ░      ░   ░  ░   
		                       
		▓█████▄ ▓█████  ▄████▄   ██▀███ ▓██   ██▓ ██▓███  ▄▄▄█████▓
		▒██▀ ██▌▓█   ▀ ▒██▀ ▀█  ▓██ ▒ ██▒▒██  ██▒▓██░  ██▒▓  ██▒ ▓▒
		░██   █▌▒███   ▒▓█    ▄ ▓██ ░▄█ ▒ ▒██ ██░▓██░ ██▓▒▒ ▓██░ ▒░
		░▓█▄     ▒▓█  ▄ ▒▓▓▄ ▄██▒▒██▀▀█▄   ░ ▐██▓░▒██▄█▓▒ ▒░ ▓██▓ ░ 
		░▒████▓ ░▒████▒▒ ▓███▀ ░░██▓ ▒██▒ ░ ██▒▓░▒██▒ ░  ░  ▒██▒ ░ 
		 ▒▒▓  ▒ ░░ ▒░ ░░ ░▒ ▒  ░░ ▒▓ ░▒▓░  ██▒▒▒ ▒▓▒░ ░  ░  ▒ ░░   
		 ░ ▒  ▒  ░ ░  ░  ░  ▒     ░▒ ░ ▒░▓██ ░▒░ ░▒ ░         ░    
		 ░ ░  ░    ░   ░          ░░   ░ ▒ ▒ ░░  ░░         ░      
		   ░       ░  ░░ ░         ░     ░ ░                       
		 ░             ░                 ░ ░                       	

    AES-GCM Wrapped JWK Key Decryption Tool
`
	titleColor.Println(banner)
}

func worker(id int, jobs <-chan string, results chan<- Result, wrappedKey *WrappedKey, salt []byte, counter *int64, totalPasswords int64, bar *progressbar.ProgressBar) {
	for password := range jobs {
		// Increment the counter
		atomic.AddInt64(counter, 1)

		// Update progress bar
		bar.Add(1)

		// Try to unwrap the key
		unwrapped, err := unwrapKey(wrappedKey, password, salt)
		if err != nil {
			// Don't report errors, just indicate failure
			results <- Result{
				Password: password,
				Success:  false,
			}
			continue
		}

		// Success!
		results <- Result{
			Password:  password,
			Unwrapped: unwrapped,
			Success:   true,
		}
	}
}

// countLines counts the number of non-empty lines in a file
func countLines(filePath string) (int64, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var count int64
	for scanner.Scan() {
		if line := strings.TrimSpace(scanner.Text()); line != "" {
			count++
		}
	}
	return count, scanner.Err()
}

func main() {
	// Define common command-line flags
	wrappedKeyFile := flag.String("key-file", "", "File containing the base64 encoded wrapped key in format 'iv.wrappedKey'")
	passwordsFile := flag.String("passwords", "", "File containing passwords to try, one per line")
	saltHex := flag.String("salt", "", "Hex-encoded salt for PBKDF2 (if not provided, empty salt will be used)")
	numWorkers := flag.Int("workers", runtime.NumCPU(), "Number of concurrent CPU workers (default: number of CPU cores)")

	// Parse flags
	flag.Parse()

	// Print the cool banner
	printBanner()

	// Validate input
	if *wrappedKeyFile == "" || *passwordsFile == "" {
		errorColor.Println("Error: Missing required parameters")
		fmt.Println("Usage: go run main.go -key-file=<wrapped_key_file> -passwords=<passwords_file> [-salt=<salt_hex>] [-workers=<num_workers>]")
		flag.PrintDefaults()
		os.Exit(1)
	}

	infoColor.Printf("🚀 Starting with %d worker goroutines\n", *numWorkers)

	// Read wrapped key from file
	infoColor.Printf("📄 Reading wrapped key from %s\n", *wrappedKeyFile)
	wrappedKeyBase64, err := readWrappedKeyFromFile(*wrappedKeyFile)
	if err != nil {
		errorColor.Printf("❌ Error reading wrapped key file: %v\n", err)
		os.Exit(1)
	}

	// Parse wrapped key
	infoColor.Print("🔑 Parsing wrapped key... ")
	wrappedKey, err := parseBase64WrappedKey(wrappedKeyBase64)
	if err != nil {
		errorColor.Printf("❌ Error parsing wrapped key: %v\n", err)
		os.Exit(1)
	}
	successColor.Println("Done!")

	// Parse salt
	var salt []byte
	if *saltHex != "" {
		infoColor.Print("🧂 Parsing salt... ")
		salt, err = hex.DecodeString(*saltHex)
		if err != nil {
			errorColor.Printf("❌ Error decoding salt hex: %v\n", err)
			os.Exit(1)
		}
		successColor.Println("Done!")
	} else {
		infoColor.Println("⚠️  No salt provided, using empty salt")
	}

	// Count total passwords for progress bar
	infoColor.Printf("📊 Counting passwords in %s... ", *passwordsFile)
	totalPasswords, err := countLines(*passwordsFile)
	if err != nil {
		errorColor.Printf("❌ Error counting passwords: %v\n", err)
		os.Exit(1)
	}
	successColor.Printf("Found %d passwords!\n", totalPasswords)

	// Open passwords file
	file, err := os.Open(*passwordsFile)
	if err != nil {
		errorColor.Printf("❌ Error opening passwords file: %v\n", err)
		os.Exit(1)
	}
	defer file.Close()

	// Create a scanner to read the passwords
	scanner := bufio.NewScanner(file)

	// Create a progress bar
	bar := progressbar.NewOptions64(
		totalPasswords,
		progressbar.OptionSetDescription("🔍 Testing passwords"),
		progressbar.OptionEnableColorCodes(true),
		progressbar.OptionShowCount(),
		progressbar.OptionSetTheme(progressbar.Theme{
			Saucer:        "[green]=[reset]",
			SaucerHead:    "[green]>[reset]",
			SaucerPadding: " ",
			BarStart:      "[",
			BarEnd:        "]",
		}),
	)

	// Create channels for communication between goroutines
	jobs := make(chan string, *numWorkers*2)    // Buffer to reduce contention
	results := make(chan Result, *numWorkers*2) // Buffer to reduce contention

	// Create a counter for tracking progress
	var counter int64

	// Create a WaitGroup to wait for all workers to finish
	var wg sync.WaitGroup

	// Launch worker goroutines
	infoColor.Println("👷 Starting worker goroutines...")
	startTime := time.Now()
	for w := 1; w <= *numWorkers; w++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			worker(id, jobs, results, wrappedKey, salt, &counter, totalPasswords, bar)
		}(w)
	}

	// Start a goroutine to close the results channel once all workers are done
	go func() {
		wg.Wait()
		close(results)
	}()

	// Start a goroutine to feed passwords to the workers
	go func() {
		for scanner.Scan() {
			password := scanner.Text()
			if password == "" {
				continue
			}
			jobs <- password
		}
		close(jobs)

		if err := scanner.Err(); err != nil {
			errorColor.Printf("❌ Error reading passwords file: %v\n", err)
		}
	}()

	// Process results as they come in
	success := false
	var successResult Result
	for result := range results {
		if result.Success {
			// Found a successful decryption
			successResult = result
			success = true

			// Force the progress bar to complete
			bar.Finish()
			break
		}
	}

	// Calculate elapsed time
	elapsedTime := time.Since(startTime)

	fmt.Println() // Add a newline after the progress bar

	if success {
		successColor.Println("\n🎉 SUCCESS! 🎉")
		infoColor.Printf("Found matching password in %s\n", elapsedTime.Round(time.Millisecond))
		fmt.Println()

		highlightColor.Println("Password:")
		fmt.Printf("  %s\n\n", successResult.Password)

		highlightColor.Println("Unwrapped JWK key:")
		fmt.Printf("  %s\n", string(successResult.Unwrapped))
	} else {
		errorColor.Println("\n❌ No matching password found")
		infoColor.Printf("Tried %d passwords in %s\n", atomic.LoadInt64(&counter), elapsedTime.Round(time.Millisecond))

		// Calculate password rate
		passwordsPerSecond := float64(atomic.LoadInt64(&counter)) / elapsedTime.Seconds()
		dimColor.Printf("Average speed: %.2f passwords/second\n", passwordsPerSecond)
	}
}
