import RPi.GPIO as GPIO
import time
import json
from beebotte import *
LED_pin=19
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_pin, GPIO.OUT)
blink = GPIO.PWM(LED_pin,500)
blink.start(0)
API_KEY = 'NjpYbJmMoLnCDS4qghOc9szI'
SECRET_KEY= 'DpMuLy89Gb39NCdLncRui1xPpH4ve1G6'
bbt = BBT(API_KEY,SECRET_KEY)
while True:
	try:
		records = bbt.read('Raspberry','valDuty')
		print (records)
		valpwm=records[0]['data']
		print (valpwm)
		blink.ChangeDutyCycle(valpwm)
	except Exception:
		print ("Error while writing to Beebotte")
