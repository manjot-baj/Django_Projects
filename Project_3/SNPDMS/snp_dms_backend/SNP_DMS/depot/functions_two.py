import logging, traceback

digit_data_dict = {
    "A": 10,
    "B": 12,
    "C": 13,
    "D": 14,
    "E": 15,
    "F": 16,
    "G": 17,
    "H": 18,
    "I": 19,
    "J": 20,
    "K": 21,
    "L": 23,
    "M": 24,
    "N": 25,
    "O": 26,
    "P": 27,
    "Q": 28,
    "R": 29,
    "S": 30,
    "T": 31,
    "U": 32,
    "V": 34,
    "W": 35,
    "X": 36,
    "Y": 37,
    "Z": 38,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "0": 0,
}


def check_digit(container_no):
    try:
        last_digit = container_no[10]
        digit_0 = digit_data_dict[container_no[0]] * 1
        digit_1 = digit_data_dict[container_no[1]] * 2
        digit_2 = digit_data_dict[container_no[2]] * 4
        digit_3 = digit_data_dict[container_no[3]] * 8
        digit_4 = digit_data_dict[container_no[4]] * 16
        digit_5 = digit_data_dict[container_no[5]] * 32
        digit_6 = digit_data_dict[container_no[6]] * 64
        digit_7 = digit_data_dict[container_no[7]] * 128
        digit_8 = digit_data_dict[container_no[8]] * 256
        digit_9 = digit_data_dict[container_no[9]] * 512
        digit_list = [
            digit_0,
            digit_1,
            digit_2,
            digit_3,
            digit_4,
            digit_5,
            digit_6,
            digit_7,
            digit_8,
            digit_9,
        ]
        summed_digit = int(sum(digit_list))
        first_answer = summed_digit / 11
        second_answer = int(first_answer) * 11
        main_answer = summed_digit - int(second_answer)
        if int(main_answer) == 10:
            main_answer = 0
        if int(main_answer) == int(last_digit):
            return True
        else:
            return False
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def check_char_digit(string):
    try:
        mylist = []
        mylist.append(string[0].isalpha())
        mylist.append(string[1].isalpha())
        mylist.append(string[2].isalpha())
        mylist.append(string[3].isalpha())
        mylist.append(string[0].isupper())
        mylist.append(string[1].isupper())
        mylist.append(string[2].isupper())
        mylist.append(string[3].isupper())
        mylist.append(string[4].isdigit())
        mylist.append(string[5].isdigit())
        mylist.append(string[6].isdigit())
        mylist.append(string[7].isdigit())
        mylist.append(string[8].isdigit())
        mylist.append(string[9].isdigit())
        mylist.append(string[10].isdigit())
        if not mylist[0] is True:
            return False
        if all(mylist) is True:
            return True
        else:
            return False
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
