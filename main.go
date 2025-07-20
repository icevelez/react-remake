package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {

	host := "localhost"
	port := 3001

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(".")))

	var err error

	fmt.Printf("Web server listening on http://%s:%d/\n", host, port)
	err = http.ListenAndServe(fmt.Sprintf("%s:%d", host, port), mux)

	if err != nil {
		log.Fatal(err)
	}
}
