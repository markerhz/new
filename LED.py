import RPi.GPIO as GPIO
import time
import json
from beebotte import *
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
LED_pin=16
GPIO.setup(LED_pin,GPIO.OUT)
API_KEY = 'NjpYbJmMoLnCDS4qghOc9szI'
SECRET_KEY= 'DpMuLy89Gb39NCdLncRui1xPpH4ve1G6'
bbt = BBT(API_KEY,SECRET_KEY)
while True:
	try:
		records = bbt.read('Raspberry','StLED')
		print (records)
		StLED=records[0]['data']
		print (StLED)
		GPIO.output(16,StLED)
	except Exception:
			print ("Error while writing to Beebotte")
