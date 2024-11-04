package routes

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	routeutils "github.com/keep-starknet-strange/art-peace/backend/routes/utils"
)

func InitBaseRoutes() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		routeutils.SetupHeaders(w)
		w.WriteHeader(http.StatusOK)
	})
		http.HandleFunc("/round-", func(w http.ResponseWriter, r *http.Request) {
			routeutils.SetupHeaders(w)
			
			// Extract round number and filename from path
			path := strings.TrimPrefix(r.URL.Path, "/round-")
			parts := strings.Split(path, "/")
			if len(parts) < 3 { 
				http.Error(w, "Invalid path", http.StatusBadRequest)
				return
			}
			
			round := parts[0]
			filename := parts[2]
			
			// Get working directory
			workDir, err := os.Getwd()
			if err != nil {
				http.Error(w, "Server error", http.StatusInternalServerError)
				return
			}
			
			// Construct absolute file path
			filepath := fmt.Sprintf("%s/nfts/round-%s/images/%s", workDir, round, filename)
			
			// Check if file exists
			if _, err := os.Stat(filepath); os.IsNotExist(err) {
				http.Error(w, fmt.Sprintf("Image not found at %s", filepath), http.StatusNotFound)
				return
			}
			
			// Set content type for images
			w.Header().Set("Content-Type", "image/png")
			
			// Serve the file
			http.ServeFile(w, r, filepath)
		})

		http.HandleFunc("/round-3/images/", func(w http.ResponseWriter, r *http.Request) {
			fmt.Printf("Received request for: %s\n", r.URL.Path)
			routeutils.SetupHeaders(w)
			
			// Get just the filename from the path
			filename := strings.TrimPrefix(r.URL.Path, "/round-3/images/")
			fmt.Printf("Filename: %s\n", filename)
			
			// Get working directory
			workDir, err := os.Getwd()
			if err != nil {
				fmt.Printf("Error getting working directory: %v\n", err)
				http.Error(w, "Server error", http.StatusInternalServerError)
				return
			}
			fmt.Printf("Working directory: %s\n", workDir)
			
			// Construct absolute file path
			filepath := fmt.Sprintf("%s/nfts/round-3/images/%s", workDir, filename)
			fmt.Printf("Looking for file at: %s\n", filepath)
			
			// Check if file exists
			if _, err := os.Stat(filepath); os.IsNotExist(err) {
				fmt.Printf("File not found: %s\n", filepath)
				http.Error(w, fmt.Sprintf("Image not found at %s", filepath), http.StatusNotFound)
				return
			}
			
			// Set content type for images
			w.Header().Set("Content-Type", "image/png")
			
			fmt.Printf("Serving file: %s\n", filepath)
			// Serve the file
			http.ServeFile(w, r, filepath)
		})
}

func InitRoutes() {
	InitBaseRoutes()
	InitCanvasRoutes()
	InitPixelRoutes()
	InitFactionRoutes()
	InitTemplateRoutes()
	InitUserRoutes()
	InitContractRoutes()
	InitNFTRoutes()
	InitQuestsRoutes()
	InitColorsRoutes()
	InitVotableColorsRoutes()
}
