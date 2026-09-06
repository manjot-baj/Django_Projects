import inflect

def int2words(n, p=inflect.engine()):
    return ''.join(p.number_to_words(n, wantlist=True, andword=''))

def dollars2words(f):
    d, dot, cents = f.partition('.')
    return "{dollars}{cents} rupees".format(
        dollars=int2words(int(d)),
        cents=" and {}/100".format(cents) if cents and int(cents) else '')

# for dollars in ['50300.45']:
#     print(dollars2words(dollars))

# print(dollars2words('500.00'))