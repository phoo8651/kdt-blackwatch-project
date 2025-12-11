package me.xyzo.blackwatchBE;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BlackwatchBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlackwatchBeApplication.class, args);
	}
}
